const axios = require("axios");
const nameShoutApiKey = process.env.NAMESHOUT_API_KEY;
const headers = { "NS-API-KEY": nameShoutApiKey };

const extractNameshoutInfo = (message) => {
  const { text } = message;
  const commandParts = text.split(" ");
  if (commandParts.length === 3) {
    return {
      action: commandParts[0],
      name: commandParts[1],
      lang: commandParts[2],
    };
  }
  if (commandParts.length === 2) {
    return { action: commandParts[0], name: commandParts[1] };
  }
  return buildDefaultMessages();
};

const searchPersonNamePath = async (name, lang = "german") => {
  const { data = {} } = await axios.get(
    `https://www.nameshouts.com/api/names/${name.toLowerCase()}/${lang.toLowerCase()}`,
    {
      headers,
    }
  );
  const { message = {} } = data;
  return message[name.toLowerCase()];
};

const nameShoutVoicePath = (path) => {
  return `https://www.nameshouts.com/libs/media/${path}.mp3`;
};

const buildNameShoutResponse = (nameShoutPersonData) => {
  if (nameShoutPersonData.path === null) {
    return {
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `Sorry that NameShout cannot pronounce *${nameShoutPersonData.name}*.`,
          },
        },
      ],
    };
  }
  return {
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `Found the name *${nameShoutPersonData.name}*.`,
        },
        accessory: {
          type: "button",
          text: {
            type: "plain_text",
            text: "Pronounces",
            emoji: true,
          },
          value: "click_me_123",
          url: nameShoutVoicePath(nameShoutPersonData.path),
          action_id: "button-action",
        },
      },
    ],
  };
};

const buildDefaultMessages = (
  message = "Sorry I don't understand, here are some tips:"
) => {
  return {
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: message,
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text:
            "`@NameShout pronounces Albert`",
        },
      },
    ],
  };
};

module.exports = function (controller) {
  controller.on("direct_message", async (bot, message) => {
    await bot.reply(message, "I heard a private message");
  });

  controller.on("direct_mention", async (bot, message) => {
    const { name, lang, action } = extractNameshoutInfo(message);
    if (action === "pronounces") {
      const nameShoutPersonData = await searchPersonNamePath(name, lang);
      await bot.reply(message, buildNameShoutResponse(nameShoutPersonData));
    } else {
      await bot.reply(message, buildDefaultMessages());
    }
  });
};
