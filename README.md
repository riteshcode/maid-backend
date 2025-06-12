project-root/
├── src/
│   ├── config/             # Configuration files (database, env, etc.)
│   ├── modules/            # Business logic split into modules
│   │   ├── users/          # User module (auth, profile, etc.)
│   │   │   ├── controllers/
│   │   │   ├── services/
│   │   │   ├── models/
│   │   │   ├── routes/
│   │   │   ├── repository/
│   │   │   ├── validators/
│   │   │   └── index.js    # Exports all user module components
│   │   ├── videos/         # Video module (upload, processing, etc.)
│   │   ├── streams/        # Streaming module (WebRTC, RTMP, HLS)
│   │   ├── chat/           # Live chat module (WebSockets)
│   │   ├── payments/       # Monetization module (Stripe, PayPal)
│   ├── middlewares/        # Authentication, logging, validation, etc.
│   ├── services/           # Shared services (email, notifications, caching)
│   ├── utils/              # Helper functions, common utilities
│   ├── tests/              # Unit & integration tests
│   ├── app.js              # Main Express app setup
│   ├── server.js           # Server entry point (Express server configuration)
│   ├── routes.js           # Centralized route handling for Express
├── .env                    # Environment variables
├── .gitignore               # Git ignore file
├── package.json            # Dependencies and scripts
├── README.md               # Documentation mkio