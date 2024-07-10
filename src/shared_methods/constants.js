const LOGGER_STATUSES = ["EXITED", "STARTED", "FAILED", "RUNNING"];

const LOGGER_STATUS_EXPLANATIONS = {
    "EXITED": "The current logger config contains no 'readers' or 'writers'",
    "FAILED": "The logger subprocess has failed to start 3 times in a row",
    "RUNNING": "The logger subprocess is active",
    "STARTED": "The logger config contains at least 1 reader or writer and the logger subprocess has either recently started or failed to start less than 3 times"
}

const CONFIG_HELP_TEXT = {
    "CachedDataReader": "Reads data that has been sent to the cache web server using field names",
    "CachedDataWriter": "Writes records to the cache web server",
    "ComposedWriter": "Apply zero or more Transforms (in series) to passed records, then write them (in parallel threads) using the specified Writers.",
    "FormatTransform": "Reformats the data using python string formatting, already parsed field names can be used inside {}.",
    "InterpolationTransform": "Computes interpolations of the specified fields using the given algorithm.",
    "LogfileWriter": "Write to the specified filebase, with datestamp appended. If filebase is a <regex>:<filebase> dict, write records to every filebase whose regex appears in the record. Creates a new file when the timestamp rolls over to a new day.",
    "PrefixTransform": "Prepend the specified prefix to the record, using space as the default separator. If prefix is a <regex>:prefix map, go through in order and use the prefix of the first regex that matches.",
    "RegexParseTransform": "Uses regular expressions to parse a '<data_id> <timestamp> <message>' record into a dictionary of fields. Files describing the fields and regex patterns can be added to the definition_path using wildcards (*)",
    "SerialReader": "Read records from a serial port.",
    "TimescaledbWriter": "Writes records to the database, preconfigured to connect to our database and use the correct tables/format.",
    "TimestampTransform": "Prepend a timestamp to a text record, the default format is '%Y-%m-%dT%H:%M:%S.%fZ' (ISO 8601).",
    "UDPSubscriptionWriter": "Writes UDP packets to specific IP addresses via unicast, subscriptions are managed via the UDP Subscription utility page.",
    "UDPWriter": "Writes UDP packets to the network (used for fixed devices)"
}

export {
    CONFIG_HELP_TEXT,
    LOGGER_STATUS_EXPLANATIONS,
    LOGGER_STATUSES
}