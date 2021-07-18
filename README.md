# Kolecoin
AIE Token with Proof-of-Authority consensus.

## AIE
- Altruistic
- Irrational
- Exuberance

## Components
#### Ledger Node
hold the network state & share it with peers via network relayers
#### Relay Node
Relay p2p websocket messages
validators "tip" the network relayers who they are connected to
#### Transactions
from,to,value,nonce,data,fee,feeLimit,signature
#### Contracts
Use a functional command-based syntax
Execution fees are calculated based on command/data usage.
Uploaded by including code in "data" field and ommitting "to" field of transaction. Validator populates the "to" field with a unique contract address.
#### NFT Contracts
A contract that "locks" after receiving a minimum payment. 
Stores the buyer, sellers, and payment receivers address (e.g. artist might want the funds to directly to charity)
Stores data about the assets such as URL to a related art piece
#### Validation Node
Validate transactions and run contract logic for a fee, update the network state
can only validate non-consecutive blocks
#### Wallets
public/private key pair can be created on the website or by any other client
#### Peer to Peer
ledger nodes, validators, contracts, and users communicate via a custom protocol over websockets relayed by relay nodes.
#### Validator Election
- Validators are authorized by Kole
- They have a certificate of authority signed by the root cert.


## Modules
- Core
    - Common logic and definitions used by the other modules.
    - e.g. contract commands, communication, transaction schemas, crypto operations.
- Ledger Node
    - Logic for writing, reading, and sharing the blockchain ledger
- Relay Node
    - Logic for relaying messages between nodes and users.
- Validator Node
    - Logic for consensus and running contracts.
- Ledger-Serverless-AWS
    - Integration adapter for deploying a serverless Ledger Node to AWS.
- Ledger-Browser
    - Integration adapter for running a Ledger node in a browser.
- Relay-Serverless-AWS
    - Integration adapter for deploying a serverless Relay Node to AWS.
- Validator-Serverless-AWS
    - Integration adapter for deploying a serverless Validator Node to AWS.
- Validator-Browser
    - Integration adapter for running a Validator in a browser.
- Web App
    - The official browser-based client. 
    - Can serve as a ledger, validator, wallet, transacter, NFT maker. 
