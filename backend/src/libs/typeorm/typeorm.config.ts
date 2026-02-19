import { join } from 'path';
import { env } from 'src/config';
import { DataSource } from 'typeorm';

const dataSource = new DataSource({
  type: 'postgres',
  url: env.postgres.url,
  entities: [join(__dirname, '..', '..', '**', '*.entity.{ts,js}')],
  synchronize: false,
  migrations: [join(__dirname, '..', '..', 'migrations', '*.{ts,js}')],
});

export default dataSource;
