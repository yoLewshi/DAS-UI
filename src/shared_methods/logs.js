const formatLogs = function(logLines) {
    return logLines.map((line) => {

        const timestamp = line.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z/);

        if(timestamp?.length) {
            line = "<span class='timestamp'>" + line.replace("Z ", "Z</span> ");
        }

        line = line.replace("WARNING", "<span class='log_block log_warning'>WARNING</span>");
        line = line.replace("ERROR", "<span class='log_block log_error'>ERROR</span>");
        line = line.replace("CRITICAL", "<span class='log_block log_error'>CRITICAL</span>");

        return line;
    })
}


export {formatLogs}