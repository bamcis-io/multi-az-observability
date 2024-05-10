import { CustomResource, Reference } from "aws-cdk-lib";
import { IFunction } from "aws-cdk-lib/aws-lambda";
import { ILogGroup } from "aws-cdk-lib/aws-logs";
import { Construct } from "constructs";
import { IAvailabilityZoneMapper } from "./IAvailabilityZoneMapper";
import { AvailabilityZoneMapperProps } from "./AvailabilityZoneMapperProps";
/**
 * A construct that allows you to map AZ names to ids and back
 */
export declare class AvailabilityZoneMapper extends Construct implements IAvailabilityZoneMapper {
    /**
     * The function that does the mapping
     */
    function: IFunction;
    /**
     * The log group for the function's logs
     */
    logGroup: ILogGroup;
    /**
     * The custom resource that can be referenced to use
     * Fn::GetAtt functions on to retrieve availability zone
     * names and ids
     */
    mapper: CustomResource;
    constructor(scope: Construct, id: string, props?: AvailabilityZoneMapperProps);
    /**
     * Gets the Availability Zone Id for the given Availability Zone Name in this account
     * @param availabilityZoneName
     * @returns
     */
    availabilityZoneId(availabilityZoneName: string): string;
    /**
     * Gets the Availability Zone Name for the given Availability Zone Id in this account
     * @param availabilityZoneId
     * @returns
     */
    availabilityZoneName(availabilityZoneId: string): string;
    /**
     * Gets the prefix for the region used with Availability Zone Ids, for example
     * in us-east-1, this returns "use1"
     * @returns
     */
    regionPrefixForAvailabilityZoneIds(): string;
    /**
     * Returns an array for Availability Zone Ids for the supplied Availability Zone names,
     * they are returned in the same order the names were provided
     * @param availabilityZoneNames
     * @returns
     */
    availabilityZoneIdsAsArray(availabilityZoneNames: string[]): string[];
    /**
     * Returns a comma delimited list of Availability Zone Ids for the supplied
     * Availability Zone names. You can use this string with Fn.Select(x, Fn.Split(",", azs)) to
     * get a specific Availability Zone Id
     * @param availabilityZoneNames
     * @returns
     */
    availabilityZoneIdsAsCommaDelimitedList(availabilityZoneNames: string[]): string;
    /**
     * Returns a comma delimited list of Availability Zone Ids for the supplied
     * Availability Zone names. You can use this string with Fn.Select(x, Fn.Split(",", azs)) to
     * get a specific Availability Zone Id
     * @returns
     */
    allAvailabilityZoneIdsAsCommaDelimitedList(): string;
    /**
     * Returns a reference that can be cast to a string array with all of the
     * Availability Zone Ids
     * @returns
     */
    allAvailabilityZoneIdsAsArray(): Reference;
    /**
     * Given a letter like "f" or "a", returns the Availability Zone Id for that
     * Availability Zone name in this account
     * @param letter
     * @returns
     */
    availabilityZoneIdFromAvailabilityZoneLetter(letter: string): string;
    /**
     * Gets all of the Availability Zone names in this Region as a comma delimited
     * list. You can use this string with Fn.Select(x, Fn.Split(",", azs)) to
     * get a specific Availability Zone Name
     * @returns
     */
    allAvailabilityZoneNamesAsCommaDelimitedList(): string;
}
