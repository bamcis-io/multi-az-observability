import os
import boto3
import datetime
import copy
import json
from datetime import timedelta
from scipy.stats import chisquare
from aws_embedded_metrics import metric_scope

cw_client = boto3.client("cloudwatch", os.environ.get("AWS_REGION", "us-east-1"))

#
#{
#  "EventType": "GetMetricData",
#  "GetMetricDataRequest": {
#    "StartTime": 1697060700,
#    "EndTime": 1697061600,
#    "Period": 300,
#    "Arguments": ["serviceregistry_external_http_requests{host_cluster!=\"prod\"}"] 
#  }
#}
#

@metric_scope
def handler(event, context, metrics):
    metrics.set_property("Event", json.loads(json.dumps(event, default = str)))
    
    event_type = event["EventType"]

    if event_type == "GetMetricData":
        try:
            return get_metric_data(event["GetMetricDataRequest"], metrics)
        except Exception as e:
            return {
                "Error": {
                    "Code": "Exception",
                    "Value": str(e)
                }
            }
    elif event_type == "DescribeGetMetricData":
        return {
            "Description": "Chi squared metric calculator"
        }
    else:
        return {}
    
#
#{
#  "EventType": "GetMetricData",
#  "GetMetricDataRequest": {
#    "StartTime": 1697060700,
#    "EndTime": 1697061600,
#    "Period": 300,
#    "Arguments": ["serviceregistry_external_http_requests{host_cluster!=\"prod\"}"] 
#  }
#}
#
def get_metric_data(event, metrics):
    start = event["StartTime"]
    end = event["EndTime"]
    period = event["Period"]
    args = event["Arguments"]
    threshold = args[0]
    az_id = args[1]
    dimensions_per_az = json.loads(args[2])
    metric_namespace = args[3]
    metric_names = args[4].split(":")
    metric_stat = args[5]
    unit = args[6]
    az_metric_key = az_id.replace("-", "_")

    #metric_query: dict = json.loads(args[2])
    #az_metric_key: str = args[3]
    #az_keys = args[4].split(",")

    metric_query = {
        "StartTime": start,
        "EndTime": end,
        "MetricDataQueries": [],
    }

    az_agg_keys = []

    for key in dimensions_per_az:

        index = 0
        az_query_keys = []

        for metric in metric_names:
            query = {
              "Id": key.replace("-", "_") + str(index),
              "Label": key + ' ' + metric,
              "ReturnData:": False,
              "MetricStat": {
                "Metric": {
                  "Namespace": metric_namespace,
                  "MetricName": metric,
                  "Dimensions": dimensions_per_az[key]
                },
                "Period": period,
                "Stat": metric_stat,
                "Unit": unit,
              }
            }

            az_query_keys.append(key.replace("-", "_")  + str(index))
            index += 1

            metric_query["MetricDataQueries"].append(query)

        metric_query["MetricDataQueries"].append({
              "Id": key.replace("-", "_") + str(index),
              "Label": key + ' ' + metric,
              "ReturnData:": True,
              "Expression": "+".join(az_query_keys)
        })

        az_agg_keys.append(key.replace("-", "_")) 

    print(json.dumps(metric_query))

    next_token: str = None

    az_counts: dict = {}

    while True:
        if next_token is not None:
            metric_query["NextToken"] = next_token

        data = cw_client.get_metric_data(**metric_query)

        if next_token is not None:
            metrics.set_property("AZCountGetMetricResult::" + next_token, json.loads(json.dumps(data, default = str)))
        else:
            metrics.set_property("AZCountGetMetricResult", json.loads(json.dumps(data, default = str)))

        # Get the top level AZ aggregate fault counts at each 
        # timestamp
        for item in data["MetricDataResults"]:          
            key = item["Id"]
            if key in az_agg_keys:
              for index, timestamp in enumerate(item["Timestamps"]):
                  if timestamp not in az_counts:
                      az_counts[timestamp] = {}

                  # Set the value for this AZ (as identified by key) for the timestamp
                  az_counts[timestamp][key] = item["Values"][index]

        if "NextToken" in data:
            next_token = data["NextToken"]

        if next_token is None:
            break

    # now we should have fault counts in each az by timestamp. Next we need to compare
    # each AZ at each timestamp to calculate the chi squared result

    # {
    #   "1234567890122344" : {
    #     "a": 0,
    #     "b": 10,
    #     "c": 5
    #   }
    # }

    results = []

    for timestamp_key in az_counts:
        vals = list(az_counts[timestamp_key].values())
        chi_sq_result = chisquare(vals)
        expected = sum(vals) / len(vals)
        p_value = chi_sq_result[1]

        # set the farthest from the average to initially be the first AZ
        farthest_from_expected = az_counts[timestamp][0]

        # compare the other AZs for this timestamp and find the one
        # farthest from the average
        for az in az_counts[timestamp_key]:
            if abs(az_counts[timestamp][az] - expected) > abs(az_counts[timestamp][farthest_from_expected] - expected):
                farthest_from_expected = az        

        # if the p-value result is less than the threshold
        # and the one that is farthest from is the AZ we are
        # concerned with, then there is a statistically significant
        # difference and emit a 1 value
        if p_value <= threshold and az_metric_key == farthest_from_expected:
            results.append(1)
        else:
            results.append(0)

    return {
        "MetricDataResults": [
          {
             "StatusCode": "Complete",
             "Label": az_id,
             "Timestamps": az_counts.keys(),
             "Values": results
          }
        ]
    }