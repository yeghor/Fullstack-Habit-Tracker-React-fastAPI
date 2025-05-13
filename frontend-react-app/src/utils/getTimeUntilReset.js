export const minutesToReset = (closestResetingTime, UNIXFromMidnight) => {
    closestResetingTime = closestResetingTime - UNIXFromMidnight

    const hours = Math.floor(closestResetingTime / 3600);
    const minutes = Math.floor((closestResetingTime % 3600) / 60);

    let timeString = '';
    
    if (hours > 0) {
        timeString += `${hours} ${hours === 1 ? 'hour' : 'hours'}`;
    }
    
    if (minutes > 0) {
        if (timeString) timeString += ' and ';
        timeString += `${minutes} ${minutes === 1 ? 'minute' : 'minutes'}`;
    }
    return timeString || 'less than a minute';
};