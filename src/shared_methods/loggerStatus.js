let ws;

function connectLoggerStatuses(websocketFn, onMessage) {
    if(!ws) {
        ws = websocketFn();
    }
    
    // don't send ready message, want to poll at a slower rate than main logger:status updates
    ws.reload(buildMessage, (message) => ws.processResponse(message, onMessage), (message) => message?.type != "data", () => {});

    return ws;
}

function buildMessage() {
     const baseMessage = {
            'type':'subscribe',
            'interval': 10,
            'fields': {
                'status:logger_status': {'seconds':1, "back_records": 1},
                'stderr:logger:*': {'seconds': 60, "back_records": 50},
                'logger:*': {'seconds': 60, "back_records": 1}
            }
        }

    return baseMessage;
}


function parseOutput(stdErrLines, liveLogLines) {

    const errorMap = {}
    const warningMap = {}
    let totalErrors = 0;
    let totalWarnings = 0;
    let mostCommonCount = 0;

    const cutoffPeriod = 24 * 60 * 60 * 1000;
    const now = (new Date()).getTime();
    const oldDataTime = now - cutoffPeriod;

    const recentStdErrLines = stdErrLines.filter((line) => {
        return line[0] > oldDataTime;
    })

    const lastMessageTime = liveLogLines ? new Date(liveLogLines[liveLogLines.length - 1][0] * 1000) : new Date(stdErrLines[stdErrLines.length - 1][0] * 1000);

    const details = {
        lastUpdated: lastMessageTime,
        errorRate: 0,
        warningRate: 0,
        lastError: "",
        lastWarning: "",
        mostCommon: ""
    }
    
    recentStdErrLines.map((line) => {
        if(line[1].indexOf("CRITICAL") > -1) {
            // TODO: improve this incase CRITICAL is there more than once in message
            const justError = line[1].split("CRITICAL")[1];
            errorMap[justError] = errorMap[justError] ? errorMap[justError]++ : 1;
            details.lastError = line[1];
            totalErrors++;

            if(errorMap[justError] >= mostCommonCount) {
                mostCommonCount = errorMap[justError];
                details.mostCommon = line[1];
            }
        }

        if(line[1].indexOf("ERROR") > -1) {
            // TODO: improve this incase ERROR is there more than once in message
            const justError = line[1].split("ERROR")[1];
            errorMap[justError] = errorMap[justError] ? errorMap[justError]++ : 1;
            details.lastError = line[1];
            totalErrors++;

            if(errorMap[justError] >= mostCommonCount) {
                mostCommonCount = errorMap[justError];
                details.mostCommon = line[1];
            }
        }

        if(line[1].indexOf("WARNING") > -1) {
            // TODO: improve this incase WARNING is there more than once in message
            const justError = line[1].split("WARNING")[1];
            warningMap[justError] = warningMap[justError] ? warningMap[justError]++ : 1;
            details.lastWarning = line[1];
            totalWarnings++;

            if(warningMap[justError] >= mostCommonCount) {
                mostCommonCount = warningMap[justError];
                details.mostCommon = line[1];
            }
        }
    });

    details.errorRate = (totalErrors / recentStdErrLines.length) * 100;
    details.warningRate = (totalWarnings / recentStdErrLines.length) * 100;

    return details
}

export {
    connectLoggerStatuses,
    parseOutput
}