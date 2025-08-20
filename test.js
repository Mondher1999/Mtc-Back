function extractVoovLink(text) {
    // Regex to match VooV Meeting links
    const regex = /(https?:\/\/voovmeeting\.com\/[^\s]+)/;
    const match = text.match(regex);
    return match ? match[0] : null;
  }
  
  const paragraph = `mondher ben haj ammar invites you to a meeting on VooV Meeting
Meeting Topic: mondher ben haj ammar's Scheduled Meeting
Time: 2025/08/19 22:30-23:00 (GMT+01:00) West Africa Standard Time - Lagos

Click the link to join the meeting or to add it to your meeting list:
https://voovmeeting.com/dm/FNFbcXJtJA6Y

#腾讯会议：664-079-932



`;
  
  const link = extractVoovLink(paragraph);
  console.log("Extracted link:", link);
  