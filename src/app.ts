import cookieParser from 'cookie-parser';
import cors from 'cors';
import 'dotenv/config';
import express from 'express';
import { errorHandler } from './middleware/error.middleware';
import router from './routes';

export const BASE_URL = 'http://localhost:5050';
// export const BASE_URL = 'http://54.180.2.174';

const app = express();
const port = 5050;

app.use(express.json());
app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  })
);
app.use(cookieParser());
app.use('/static', express.static('upload'));
app.use(router);

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running http://localhost:5050`);
  // console.log(
  //   `ci/cd 업데이트 완료! Server running at http://54.180.2.174 prisma: http://54.180.2.174:5555`
  // );
});
