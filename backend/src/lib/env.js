import "dotenv/config";

export const ENV = {
  PORT: process.env.PORT,
  DB_URL: process.env.DB_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  NODE_ENV: process.env.NODE_ENV,
  CLIENT_URL: process.env.CLIENT_URL,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  EMAIL_FROM: process.env.EMAIL_FROM,
  EMAIL_FROM_NAME: process.env.EMAIL_FROM_NAME,
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
};

// PORT=5000

// DB_URL = mongodb+srv://nourihab745_db_user:ihahuLTML2IyEGhq@chatny-cluster.wnir6tk.mongodb.net/chatny_db?appName=Chatny-Cluster

// NODE_ENV = development

// RESEND_API_KEY = re_gxbBEyqZ_3HDAx46X3V2KAt4FHbwuWC8Y
// EMAIL_FROM="oncompiling@resend.dev"
// EMAIL_FROM_NAME="Nour Ihab"
// JWT_SECRET = myjwtsecret

// CLIENT_URL = http://localhost:5173
