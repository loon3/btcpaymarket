# btcpaymarket

### Overview

BTCPAYmarket.com utilizes the Counterparty DEX (decentralized exchange). This site does not maintain any databases and all information is queried from publicly available block chain APIs.

### Secure

All encryption is handled client-side. Neither your passphrase nor any of your private information ever leaves your browser. Transactions are assembled and signed in your browser then pushed to the Bitcoin network.

### How it Works

Buying assets with BTC requires two transactions. First, click on an Active Order in the Asset Market table (highlighted in yellow) to send an Order transaction. After the Order transaction has confirmed, a Pending Order Match will appear in the Order Matches table. Click on the Pending Order Match to send an Order Match transaction (BTCPAY) to complete your order.

Selling assets for BTC only requires one transaction. Click on the asset you wish to sell in the Assets menu then click the Sell button. Sell orders expire after 1000 blocks (about 1 week) and appear in the Asset Market table highlighted in green.

### Comments or Questions?

Submit an issue here or send email to info@btcpaymarket.com
