declare namespace NodeJS {
  export interface ProcessEnv {
    APP_PORT: string;
    POSTGRES_HOST_DEVELOPMENT: string;
    POSTGRES_PORT_DEVELOPMENT: string;
    POSTGRES_HOST_TEST: string;
    POSTGRES_PORT_TEST: string;
    POSTGRES_HOST: string;
    POSTGRES_PORT: string;
    POSTGRES_USER: string;
    POSTGRES_PASSWORD: string;
    HOME: string;
    CORS_ALLOW: string;
  }
}
