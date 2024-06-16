import os
import boto3
import json
import time
import traceback
import sys
from scipy.stats import chisquare
from numpy import float64
import numpy
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
    start = time.perf_counter()
    metrics.set_dimensions(
        {
            "Operation": "ChiSquared",
            "EventType": event["EventType"],
            "Region": os.environ.get("AWS_REGION", "us-east-1")
        }
    )
    metrics.set_namespace("ChiSquared")
    metrics.set_property("Event", json.loads(json.dumps(event, default = str)))
    
    event_type = event["EventType"]

    if event_type == "GetMetricData":
        try:
            result = get_metric_data(event["GetMetricDataRequest"], metrics)
            metrics.put_metric("Success", 1, "Count")

            end = time.perf_counter()
            metrics.put_metric("SuccessLatency", (end - start) * 1000, "Milliseconds")
            return result
        except Exception as e:

            end = time.perf_counter()
            metrics.put_metric("FaultLatency", (end - start) * 1000, "Milliseconds")
            metrics.put_metric("Fault", 1, "Count")

            info = sys.exc_info()

            exc_info = sys.exc_info()
            details = ''.join(traceback.format_exception(*exc_info))
            exc_type, exc_value, exc_context = sys.exc_info()

            metrics.set_property("Exception", {
                "type": exc_type.__name__,
                "description": str(exc_value),
                "details": details
            })

            return {
                "Error": {
                    "Code": "Exception",
                    "Value": str(e)
                }
            }
    elif event_type == "DescribeGetMetricData":
        end = time.perf_counter()
        metrics.put_metric("SuccessLatency", (end - start) * 1000, "Milliseconds")
        metrics.put_metric("Success", 1, "Count")
        return {
            "Description": "Chi squared metric calculator"
        }
    else:
        metrics.set_property("Error", "Unknown event type")
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
    args: list = event["Arguments"]
    threshold: float = float(args[0])
    metrics.set_property("Threshold", threshold)
    az_id: str= args[1]
    metrics.set_property("AZ-ID", az_id)
    #
    # {
    #    "use1-az1": [
    #        {
    #          "Operation": "Ride",
    #          "AZ-ID": "use-az1",
    #          "Region": "us-east-1"
    #        }
    #    ],
    #    "use1-az2": [
    #    ]
    # }
    #
    dimensions_per_az: dict = json.loads(args[2])
    metric_namespace: str = args[3]
    metrics.set_property("Namespace", metric_namespace)
    metric_names: list = args[4].split(":")
    metric_stat: str = args[5]
    unit: str = args[6]

    metric_query = {
        "StartTime": start,
        "EndTime": end,
        "MetricDataQueries": [],
    }

    operation = ""

    for az in dimensions_per_az:

        for dimension_set in dimensions_per_az[az]:

            index = 0
            az_query_keys = []

            dimensions = []

            for dim in dimension_set:
                dimensions.append({
                    "Name": dim,
                    "Value": dimension_set[dim]
                })

                if dim == "Operation":
                    operation = dimension_set[dim]

            for metric in metric_names:
                query = {
                  "Id": az.replace("-", "_") + str(index),
                  "Label": az + ' ' + metric,
                  "ReturnData": False,
                  "MetricStat": {
                    "Metric": {
                      "Namespace": metric_namespace,
                      "MetricName": metric,
                      "Dimensions": dimensions
                    },
                    "Period": 60,
                    "Stat": metric_stat,
                    "Unit": unit,
                  }
                }

                az_query_keys.append(az.replace("-", "_")  + str(index))
                index += 1

                metric_query["MetricDataQueries"].append(query)

        metric_query["MetricDataQueries"].append({
            "Id": az.replace("-", "_"),
            "Label": az,
            "ReturnData": True,
            "Expression": "+".join(az_query_keys)
        })

    metrics.set_property("Query", json.loads(json.dumps(metric_query, default = str)))

    if operation != "":
        metrics.set_property("ServiceOperation", operation)

    next_token: str = None

    az_counts: dict = {}

    while True:
        if next_token is not None:
            metric_query["NextToken"] = next_token

        data = cw_client.get_metric_data(**metric_query)

        if next_token is not None:
            metrics.set_property("GetMetricResult::" + next_token, json.loads(json.dumps(data, default = str)))
        else:
            metrics.set_property("GetMetricResult", json.loads(json.dumps(data, default = str)))

        for item in data["MetricDataResults"]:          
            az_id_of_query = item["Id"].replace("_", "-")
            
            for index, timestamp in enumerate(item["Timestamps"]):
                epoch_timestamp = int(timestamp.timestamp())
                if epoch_timestamp not in az_counts:
                    az_counts[epoch_timestamp] = {az:0 for az in dimensions_per_az}

                # Set the value for this AZ (as identified by key) for the timestamp
                az_counts[epoch_timestamp][az_id_of_query] = item["Values"][index]

        if "NextToken" in data:
            next_token = data["NextToken"]

        if next_token is None:
            break

    # now we should have fault counts in each az by timestamp. Next we need to compare
    # each AZ at each timestamp to calculate the chi squared result

    # {
    #   "1716494472" : {
    #     "use1-az1": 0,
    #     "use1-az2": 10,
    #     "use1-az6": 5
    #   }
    # }

    metrics.set_property("InterimCalculation", json.loads(json.dumps(az_counts, default = str)))

    results = []

    # dict isn't guaranteed to be ordered because
    # 1 get metric result might have timestamps that are
    # not present in the other results
    # use sorted to get a sorted list of timestamp
    # keys and then access the original dict
    for timestamp_key in sorted(az_counts.keys(), reverse = True):
        vals = list(az_counts[timestamp_key].values())
        
        if not all(v == 0 for v in vals):
            chi_sq_result = chisquare(vals)

            if len(vals) > 0:
                expected = sum(vals) / len(vals)
                p_value: float64 = chi_sq_result.pvalue
                metrics.set_property("PValue_" + str(timestamp_key), str(p_value))

                for az in az_counts[timestamp_key]:
                    # set the farthest from the average to initially be the first AZ
                    farthest_from_expected = az
                    break

                # compare the other AZs for this timestamp and find the one
                # farthest from the average
                for az in az_counts[timestamp_key]:
                    if abs(az_counts[timestamp_key][az] - expected) > abs(az_counts[timestamp_key][farthest_from_expected] - expected):
                        farthest_from_expected = az        

                # if the p-value result is less than the threshold
                # and the one that is farthest from is the AZ we are
                # concerned with, then there is a statistically significant
                # difference and emit a 1 value
                if not numpy.isnan(p_value) and p_value <= threshold and az_id == farthest_from_expected:
                    results.append(1)
                else:
                    results.append(0)
            else:
                metrics.set_property("PValue_" + str(timestamp_key), "No values for timestamp.")
                results.append(0)
            
        else:
            metrics.set_property("PValue_" + str(timestamp_key), "All values are zero.")
            results.append(0)

    data_results = {
        "MetricDataResults": [
          {
             "StatusCode": "Complete",
             "Label": az_id,
             "Timestamps": sorted(az_counts.keys(), reverse = True),
             "Values": results
          }
        ]
    }

    metrics.set_property("Results", json.loads(json.dumps(data_results, default = str)))

    return data_results