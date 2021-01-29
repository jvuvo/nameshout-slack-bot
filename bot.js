const { Botkit } = require("botkit");

const {
  SlackAdapter,
  SlackMessageTypeMiddleware,
  SlackEventMiddleware,
} = require("botbuilder-adapter-slack");

const { MongoClient } = require("mongodb");

// Load process.env values from .env file
require("dotenv").config();

const storage = {
  delete: () => {},
  read: () => {},
  write: () => {},
};
MongoClient.connect(
  process.env.MONGO_URI,
  {
    useUnifiedTopology: true,
  },
  function (err, client) {
    if (err) return console.error(err);
    console.log("Connected to Database");
    const db = client.db("nameshout");
    storage["tenants"] = db.collection("tenants");

    const adapter = new SlackAdapter({
      verificationToken: process.env.VERIFICATION_TOKEN,
      clientSigningSecret: process.env.CLIENT_SIGNING_SECRET,
      clientId: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      scopes: ["bot"],
      redirectUri: process.env.REDIRECT_URI,
      getTokenForTeam: getTokenForTeam,
      getBotUserByTeam: getBotUserByTeam,
    });

    adapter.use(new SlackEventMiddleware());

    adapter.use(new SlackMessageTypeMiddleware());

    const controller = new Botkit({
      webhook_uri: "/api/messages",
      adapter: adapter,
    });

    controller.ready(() => {
      // load bot skills
      controller.loadModules(__dirname + "/features");
    });

    controller.webserver.get("/", (req, res) => {
      res.send(`Nameshout app`);
    });

    controller.webserver.get("/install", (req, res) => {
      res.redirect(controller.adapter.getInstallLink());
    });

    controller.webserver.get("/install/auth", async (req, res) => {
      try {
        const results = await controller.adapter.validateOauthCode(
          req.query.code
        );
        storage.tenants.insertOne(results);
        res.json(`Nameshout app has successfully been installed on your ${results.team_name} Slack team! ✌️❤️`);
      } catch (err) {
        console.error("OAUTH ERROR:", err);
        res.status(401);
        res.send(err.message);
      }
    });

    async function getTokenForTeam(teamId) {
      const tenant = await storage.tenants.findOne({ team_id: teamId });
      if (tenant) {
        return new Promise((resolve) => {
          resolve(tenant.bot.bot_access_token);
        });
      } else {
        console.error("Team not found in storage: ", teamId);
      }
    }

    async function getBotUserByTeam(teamId) {
      const tenant = await storage.tenants.findOne({ team_id: teamId });
      if (tenant) {
        return new Promise((resolve) => {
          resolve(tenant.bot.bot_user_id);
        });
      } else {
        console.error("Team not found in storage: ", teamId);
      }
    }
  }
);
