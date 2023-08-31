import morgan from 'morgan';
import { AppError } from './utils/AppError.js';
export function bootstrap(app) {
  app.use(morgan('dev'));

  app.use('/api/v1/', (req, res, next) => {
    res.json('hello world!.');
  });

  app.all('*', (req, res, next) => {
    next(new AppError(`Invalid endpoint ${req.originalUrl}`, 404));
  });
}
