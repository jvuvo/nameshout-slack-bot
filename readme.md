# Nameshout bot

### Run app in local

Step 1: setup environment
```
mv .env_example .env
```
Create a slack app at https://api.slack.com/apps
```
CLIENT_SIGNING_SECRET=
CLIENT_ID=
CLIENT_SECRET=
```
Setup NameShout API KEY at https://www.nameshouts.com/developer
```
NAMESHOUT_API_KEY=<your key>
```

Step 2: Install & Start
```
npm install
npm start
```

Step 3: Setup tunnel
```
ngrok http 3000
```

Step 4: Update ngrok to app environment
```
REDIRECT_URI=https://b780ef3e3fe9.ngrok.io/install/auth
```

Step 5: Setup redirect URI to slack app at https://api.slack.com/apps

Step 6: Open https://b780ef3e3fe9.ngrok.io/install


DEMO

https://nameshout.herokuapp.com/install


