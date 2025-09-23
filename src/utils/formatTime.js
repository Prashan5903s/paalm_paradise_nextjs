export default function formatTime(timestamp) {
    if (!timestamp) return "-";

    const date = new Date(timestamp);

    const options = {
        year: "numeric",
        month: "short", // Jan, Feb, ...
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true, // 12-hour format with AM/PM
    };

    return date.toLocaleString("en-US", options);
}
