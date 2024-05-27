// app.ts — входной файл
import express from 'express';
import mongoose from 'mongoose';

const app = express();

// подключаемся к серверу MongoiDB
mongoose.connect('mongodb://localhost:27017/mestodb');

// подключаем мидлвары, роуты и всё остальное...

app.listen(3000);