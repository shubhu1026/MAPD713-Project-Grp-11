function parseHumanReadableTime(timeString) {
  const [hoursMinutes, ampm] = timeString.split(" ");

  let [hours, minutes] = hoursMinutes.split(".");
  hours = parseInt(hours);
  minutes = parseInt(minutes || 0);

  if (ampm === "pm" && hours !== 12) {
    hours += 12;
  } else if (ampm === "am" && hours === 12) {
    hours = 0;
  }

  const date = new Date();
  date.setHours(hours);
  date.setMinutes(minutes);

  return date;
}

// Test different time formats
const timeFormats = ["10.20 am", "11.45 pm", "9.15 am"];

timeFormats.forEach((format) => {
  const parsedTime = parseHumanReadableTime(format);
  console.log(`Input: ${format} => Parsed Time: ${parsedTime}`);
});
