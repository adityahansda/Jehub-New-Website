self.__BUILD_MANIFEST = {
  "polyfillFiles": [
    "static/chunks/polyfills.js"
  ],
  "devFiles": [
    "static/chunks/react-refresh.js"
  ],
  "ampDevFiles": [],
  "lowPriorityFiles": [],
  "rootMainFiles": [],
  "pages": {
    "/": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/index.js"
    ],
    "/_app": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/_app.js"
    ],
    "/_error": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/_error.js"
    ],
    "/about": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/about.js"
    ],
    "/blog": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/blog.js"
    ],
    "/community": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/community.js"
    ],
    "/join-team": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/join-team.js"
    ],
    "/leaderboard": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/leaderboard.js"
    ],
    "/notes-request": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/notes-request.js"
    ],
    "/notes-upload": [
      "static/chunks/webpack.js",
      "static/chunks/main.js",
      "static/chunks/pages/notes-upload.js"
    ]
  },
  "ampFirstPages": []
};
self.__BUILD_MANIFEST.lowPriorityFiles = [
"/static/" + process.env.__NEXT_BUILD_ID + "/_buildManifest.js",
,"/static/" + process.env.__NEXT_BUILD_ID + "/_ssgManifest.js",

];