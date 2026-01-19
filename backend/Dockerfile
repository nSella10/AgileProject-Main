# שלב 1: בסיס
FROM node:18-alpine

# שלב 2: תיקיית עבודה
WORKDIR /app

# שלב 3: להעתיק את package.json + package-lock.json
COPY package*.json ./

# שלב 4: התקנת תלויות
RUN npm install

# שלב 5: להעתיק את שאר קבצי ה backend
COPY . .

# שלב 6: לפתוח פורט
EXPOSE 8000

# שלב 7: פקודת הרצה
CMD ["npm", "start"]
