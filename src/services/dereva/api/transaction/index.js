/* eslint-disable no-magic-numbers */

const identity = require('identity-client');

const {
  SERVER_ERROR,
  USER_NOT_FOUND_ERROR,
  INSUFFICIENT_FUNDS,
  UNAVAILABLE_TOKEN
} = require('../../../../errors');

const {
  DRV100,
  DRV200
} = require('../../contracts');

const getDrvTokenBalance = require('./get-drv-token-balance');

module.exports = async ({
  token,
  username,
  recipient,
  recipientAddress,
  usdValue,
  drvValue,
  cardNumber = false,
  squareToken = false,
  contract = 'DRV100'
}) => {
  if (!username || !token) return;

  const senderResult = await identity.read({ username, token });
  const recipientResult = await identity.read({ username: recipient, token });

  let senderResponse;

  if (senderResult?.username) {
    senderResponse = {
      username: senderResult.username,
      userData: senderResult?.appData?.dereva
    };
  }

  let recipientResponse;

  if (recipientResult?.username) {
    recipientResponse = {
      username: recipientResult.username,
      userData: recipientResult?.appData?.dereva
    };
  }

  if (!senderResponse?.username || !recipientResponse?.username) {
    return USER_NOT_FOUND_ERROR;
  }

  const isDrv = !squareToken && !cardNumber;
  const isFungible = contract === 'DRV100';

  if (isDrv) {
    if (isFungible) {
      const senderTokenDrvBalance = await getDrvTokenBalance({
        address: senderResponse.userData.address
      });

      if (senderTokenDrvBalance < drvValue) {
        return INSUFFICIENT_FUNDS;
      }
    }
  } else {
    if (isFungible) {
      const recipientTokenDrvBalance = await getDrvTokenBalance({
        address: recipientAddress
      });

      if (recipientTokenDrvBalance < drvValue) {
        return UNAVAILABLE_TOKEN;
      }
    }
  }

  const transactionResult = isFungible
    ? await DRV100({
      token,
      sender: senderResponse,
      recipient: recipientResponse,
      recipientAddress,
      usdValue,
      drvValue,
      isDrv
    })
    : await DRV200({
      token,
      sender: senderResponse,
      recipient: recipientResponse,
      recipientAddress,
      usdValue,
      drvValue
    });

  if (!transactionResult) {
    return SERVER_ERROR;
  }

  user = await identity.read({
    username,
    token
  });

  if (isFungible) {
    console.log(
      // eslint-disable-next-line max-len
      `<Dereva> ${senderResponse.username} sent ${recipientResponse.username} ${isDrv ? `${drvValue.toFixed(2)} DRV` : `${usdValue.toFixed(2)} USD`}.`
    );
  } else {
    console.log(
      // eslint-disable-next-line max-len
      `<Dereva> ${senderResponse.username} transferred a record to ${senderResponse.username === recipientResponse.username ? 'the blockchain' : recipientResponse.username}.`
    );
  }

  return {
    success: true,
    user: {
      id: user.id,
      username: user.username,
      token: user.token,
      isOnline: user.isOnline,
      userData: {
        address: user.userData.address
      }
    },
    price: transactionResult.price,
    price24hAgo: transactionResult.price24hAgo,
    marketCap: transactionResult.marketCap
  };
};
