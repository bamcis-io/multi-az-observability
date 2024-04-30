import urllib3
import json
import os
import boto3

SUCCESS = "SUCCESS"
FAILED = "FAILED"
http = urllib3.PoolManager()
region = os.environ.get("REGION")
ec2 = boto3.client('ec2', region_name = region)

def handler(event, context):
  print(event)
  if event['RequestType'] == 'Delete':
    sendResponse(event, context, SUCCESS, {})
    return

  zone_names=[]
  if 'ResourceProperties' in event and 'AvailabilityZones' in event['ResourceProperties'] and event['ResourceProperties']['AvailabilityZones'] != '':
    zone_names = event['ResourceProperties']['AvailabilityZones']
  
  in_use_azs = ec2.describe_availability_zones(Filters=[ { 'Name': 'zone-type', 'Values': [ 'availability-zone'] } ], ZoneNames = zone_names)
  all_azs = ec2.describe_availability_zones(Filters=[ { 'Name': 'zone-type', 'Values': [ 'availability-zone'] } ], ZoneNames = zone_names)

  az_map = {
    'a' : '', 
    'b' : '', 
    'c' : '', 
    'd' : '', 
    'e' : '', 
    'f' : '', 
    'az1' : '', 
    'az2' : '', 
    'az3' : '', 
    'az4' : '', 
    'az5' : '', 
    'az6' : ''
  }

  # Supply the region and get its shorthand
  az_map[region] = all_azs["AvailabilityZones"][0]["ZoneId"].split("-")[0]

  # Get the in use availability zone Ids as comma delimited list
  az_map["InUseAvailabilityZoneIds"] = ",".join(x["ZoneId"] for x in in_use_azs["AvailabilityZones"])

  # Get the in use availability zone Ids as an array
  az_map["InUseAvailabilityZoneIdsArray"] = (x["ZoneId"] for x in in_use_azs["AvailabilityZones"])

  # Get the in use availability zone names as comma delimited list
  az_map["InUseAvailabilityZoneNames"] = ",".join(x["ZoneName"] for x in in_use_azs["AvailabilityZones"])

  # Get the in use availability zone names as an array
  az_map["InUseAvailabilityZoneNames"] = ",".join(x["ZoneName"] for x in in_use_azs["AvailabilityZones"])

  # Make a comma delimited list of name to id joined with a colon
  az_map["InUseAvailabilityZoneNameToIdMap"] = ",".join(x["ZoneName"] + ":" + x["ZoneId"] for x in in_use_azs["AvailabilityZones"])
  
  # Make a comma delimited list of name to id joined with a colon for all AZs
  az_map["AllAvailabilityZoneNameToIdMap"] = ",".join(x["ZoneName"] + ":" + x["ZoneId"] for x in all_azs["AvailabilityZones"])
  
  # All availability zones in the region
  az_map["AllAvailabilityZoneIds"] = ",".join(x["ZoneId"] for x in all_azs["AvailabilityZones"])
  az_map["AllAvailabilityZoneIdsArray"] = (x["ZoneId"] for x in all_azs["AvailabilityZones"])
  az_map["AllAvailabilityZoneNames"] = ",".join(x["ZoneName"] for x in all_azs["AvailabilityZones"])
  az_map["AllAvailabilityZoneNamesArray"] = (x["ZoneName"] for x in all_azs["AvailabilityZones"])
  
  # Allow lookups for individual AZ names to Ids
  for item in all_azs['AvailabilityZones']:
    az_map[item['ZoneName']] = item['ZoneId']
    az_map[item['ZoneId']] = item['ZoneName']
    az_id = item['ZoneId'].split('-')[1].lower()
    az_map[az_id] = item['ZoneName']
    az_letter = item['ZoneName'][-1]
    az_map[az_letter] = item['ZoneId']

  print(json.dumps(az_map))

  sendResponse(event, context, SUCCESS, az_map)
  return

def sendResponse(event, context, responseStatus, responseData, physicalResourceId=None, noEcho=False, reason=None):
  responseUrl = event['ResponseURL']
  print(responseUrl)
  responseBody = {
    'Status' : responseStatus,
    'Reason' : reason or "See the details in CloudWatch Log Stream: {}".format(context.log_stream_name),
    'PhysicalResourceId' : physicalResourceId or context.log_stream_name,
    'StackId' : event['StackId'],
    'RequestId' : event['RequestId'],
    'LogicalResourceId' : event['LogicalResourceId'],
    'NoEcho' : noEcho,
    'Data' : responseData
  }
  json_responseBody = json.dumps(responseBody)
  print("Response body:")
  print(json_responseBody)
  headers = {
    'content-type' : '',
    'content-length' : str(len(json_responseBody))
  }
  try:
    response = http.request('PUT', responseUrl, headers=headers, body=json_responseBody)
    print("Status code:", response.status)
  except Exception as e:
    print("send(...) failed executing http.request(..):", e)