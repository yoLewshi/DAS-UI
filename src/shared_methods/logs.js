const formatLogs = function(logLines) {
    return logLines.map((line) => {

        line = line.replace("WARNING", "<span class='log_block log_warning'>WARNING</span>");
        line = line.replace("ERROR", "<span class='log_block log_error'>ERROR</span>");
        line = line.replace("CRITICAL", "<span class='log_block log_error'>CRITICAL</span>");

        return line;
    })
}


export {formatLogs}