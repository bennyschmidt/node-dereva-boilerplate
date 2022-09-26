This project was bootstraped with [`node-service-core`](https://github.com/bennyschmidt/node-service-core).

Add an `.env` file to the root of your directory with the following scaffold:

```
  DATA_URI=
  HOST=
  PORT=
  TOKEN_ADDRESS=
  TOKEN_NAME=
  TOKEN_LOGO_URL=
  TOKEN_DENOMINATION=
```

- `DATA_URI`: Your [DSS Database](https://github.com/exactchange/dss) URI.
- `HOST`: The address at which you host this app.
- `PORT`: The port you're serving it over.
- `TOKEN_ADDRESS`, `TOKEN_NAME`, `TOKEN_LOGO_URL`, & `TOKEN_DENOMINATION`: This is the protocol info your peer instance will broadcast to the network. If your protocol instance is not for fungible token systems, you can just use `1` for the `TOKEN_DENOMINATION`.
