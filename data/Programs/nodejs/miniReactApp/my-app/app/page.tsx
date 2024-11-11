
// app/page.tsx
'use client';  // 这行代码确保这个组件是一个客户端组件

import React, { useState, useEffect } from 'react';
import { Account, OKXTonConnectUI, Wallet ,OKX_UI_CONNECTION_AND_TRANSACTION_EVENT, BridgeConnectionRequest, OKXUniversalConnectUI, THEME} from "@okxconnect/ui";
import {DAppRequest, OKXConnectManager, OKXCONNECTOR_DISCONNECT_EVENT, OKXCONNECTOR_REQUEST_EVENT, OKXCONNECTOR_SESSION_PROPOSAL_EVENT, SessionInfo} from "@okxconnect/walletsdk"


export default function Home() {


  useEffect(() => {
    // 确保代码在浏览器环境中执行
    if (typeof window !== 'undefined') {
      window.addEventListener(
        OKX_UI_CONNECTION_AND_TRANSACTION_EVENT.OKX_UI_CONNECTION_STARTED,
        (event: Event) => {
          if (event instanceof CustomEvent) {
            console.log('evt  1', event.detail);
            alert('Transaction init:' + JSON.stringify(event.detail));
          }
        }
      );

      window.addEventListener(
        OKX_UI_CONNECTION_AND_TRANSACTION_EVENT.OKX_UI_CONNECTION_COMPLETED,
        (event: Event) => {
          if (event instanceof CustomEvent) {
            console.log('evt  2', event.detail);
            alert('Transaction init:' + JSON.stringify(event.detail));
          }
        }
      );

      window.addEventListener(
        OKX_UI_CONNECTION_AND_TRANSACTION_EVENT.OKX_UI_CONNECTION_ERROR,
        (event: Event) => {
          if (event instanceof CustomEvent) {
            console.log('evt  3', event.detail);
            alert('Transaction init:' + JSON.stringify(event.detail));
          }
        }
      );


      window.addEventListener(
        OKX_UI_CONNECTION_AND_TRANSACTION_EVENT.OKX_UI_CONNECTION_RESTORING_STARTED,
        (event: Event) => {
          if (event instanceof CustomEvent) {
            console.log('evt  4', event.detail);
            alert('Transaction init:' + JSON.stringify(event.detail));
          }
        }
      );


      window.addEventListener(
        OKX_UI_CONNECTION_AND_TRANSACTION_EVENT.OKX_UI_DISCONNECTION,
        (event: Event) => {
          if (event instanceof CustomEvent) {
            console.log('evt  5', event.detail);
            alert('Transaction init:' + JSON.stringify(event.detail));
          }
        }
      );


    }    

    // 组件卸载时清除事件监听
    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener(
          OKX_UI_CONNECTION_AND_TRANSACTION_EVENT.OKX_UI_CONNECTION_STARTED,
          (event) => {
            console.log('Transaction init', event);
          }
        );
      }
    };
  }, []);

  const [labelText, setLabelText] = useState('Initial Label');
  const [walletText, setWalletText] = useState('Initial Wallet');
  const [accountText, setAccountText] = useState('Initial Account');

  const updateLabelText = (str : string) => {
    setLabelText(str);
  };

  const updateWalletText = (wallet : Wallet | null) => {
    let text = "NULL";
    if (wallet != null) {
      text = JSON.stringify( wallet.provider); 
    }setWalletText(text);
  };

  const updateAccountText = (wallet : Account | null) => {
    let text = "NULL";
    if (wallet != null) {
      text = wallet.address; 
    }
    setAccountText(text);
  };

  let universalUi: OKXUniversalConnectUI | null = null
  let okxTonConnectUI: OKXTonConnectUI | null = null

  const handleConnect = async () => {
    // alert("OKX Button Clicked!");

    const connectManager = new OKXConnectManager()

      //会话连接回调
    const sessionProposalCallback = (sessionInfo: SessionInfo, connection: BridgeConnectionRequest) => {
      // 收到
      console.log('on connect manager called:')
      console.log("callback:" + JSON.stringify(sessionInfo));
      alert("callback:" + JSON.stringify(sessionInfo) + "\n" + JSON.stringify(connection.dAppInfo));
    
    }
    //收到请求回调
    const requestCallback = async (topic: string, rsp: DAppRequest) => {
      alert(topic + ",requestCallback:" + JSON.stringify(rsp));
      console.log('requestCallback' + rsp)
      // 模拟收到请求返回处理
      await connectManager.sendResponse(topic, rsp)
    }
    //断开连接回调
    const disconnectCallback = (sessionInfo: SessionInfo) => {
      alert("disconnectCallback:" + JSON.stringify(sessionInfo));
    }

    connectManager.on(OKXCONNECTOR_SESSION_PROPOSAL_EVENT, sessionProposalCallback)

    // 监听消息请求
    connectManager.on(OKXCONNECTOR_REQUEST_EVENT, requestCallback)

    // 监听消息请求
    connectManager.on(OKXCONNECTOR_DISCONNECT_EVENT, disconnectCallback);

    await connectManager.init()
  
    okxTonConnectUI = new OKXTonConnectUI({
        dappMetaData: {
          name: "application name",
          icon: "application icon url"
        },
        // buttonRootId: 'button-root',
        actionsConfiguration:{
          returnStrategy:'tg://resolve',
          tmaReturnUrl:'back'
        },
        uiPreferences: {
          theme: THEME.DARK
        },
        language: 'zh_CN',
        restoreConnection: true
      });


    await okxTonConnectUI.openModal();

    updateLabelText(okxTonConnectUI.connected ? "connected" : "not connected");
    updateWalletText(okxTonConnectUI.wallet);
    updateAccountText(okxTonConnectUI.account);


  };

 
  const handleConnectUi = async () => {
    
    universalUi = await OKXUniversalConnectUI.init({
      dappMetaData: {
        icon: "https://static.okx.com/cdn/assets/imgs/247/58E63FEA47A2B7D7.png",
        name: "OKX WalletConnect UI Demo"
      },
      actionsConfiguration: {
        returnStrategy: 'tg://resolve',
        modals:"all",
        tmaReturnUrl:'back'
      },
      language: "en_US",
      uiPreferences: {
        theme: THEME.LIGHT
      },
    });

    const session = await universalUi.openModal({
      namespaces: {
        eip155: {
          chains: ["eip155:1", "eip155:xxx"],
          rpcMap: {
            1: "https://mainnet.infura.io/v3/c7e8057fade44aaeb27574f2f11170c0" // set your own rpc url
          },
          defaultChain: "1"
        }
      },
      optionalNamespaces: {
        eip155: {
          chains: ["eip155:43114"]
        }
      }
    });

    if (session != null) {
      alert(JSON.stringify(session))
      updateLabelText(JSON.stringify(session.wallet));
    }

          // 生成 universalLink  
      universalUi.on("display_uri", (uri: string) => {
        updateLabelText("display_uri : " + uri);
      });

      // session 信息变更（例如添加自定义链）会触发该事件；
      universalUi.on("session_update", (session2: object) => {
        console.log(JSON.stringify(session2));
        updateLabelText(JSON.stringify(session2));
      });

      // 断开连接会触发该事件；
      universalUi.on("session_delete", (topic: object) => {
        console.log(JSON.stringify(topic));
        updateLabelText(JSON.stringify(topic));
      });
  
  }

  const handleDisconnectUi = async () => {
    if (universalUi != null) {
      universalUi.closeModal();
    }
  }

  const handleDisconnect = async () => {
    if (okxTonConnectUI != null && okxTonConnectUI.connected) {
      await okxTonConnectUI.disconnect();
      okxTonConnectUI.closeModal();
      updateLabelText(okxTonConnectUI.connected ? "connected" : "not connected");
    } else {
      alert("okxTonConnectUI is null");
    }
  };

  const checkStatus = async () => {
    if (universalUi != null) {
      alert(JSON.stringify(universalUi.getWallets()));
      updateLabelText(universalUi.connected() ? "connected" : "not connected");
    } else {
      alert("not connected~ just checked it");
      updateLabelText("not connected~ just checked it");
    }
  };


  return (
    <div>
      <h1>Welcome to OKX Connect UI</h1>
      
      <div>
        <h1> Connect status</h1>
        <h2 id="status">{labelText}</h2>
      </div>
      

      <div>
        <h1>  Click me to connect TON </h1>
        <button id='button-root' onClick={handleConnect}>Connect to OKX TON UI</button>
      </div>

      <div>
        <h1> Click me to disconnect TON</h1>
        <button id='button-root-dis' onClick={handleDisconnect}>Disconnect to OKX TON UI</button>
      </div>

            
      <div>
        <h1>  Click me to connect UI</h1>
        <button id='button-root' onClick={handleConnectUi}>Connect to OKX UI</button>
      </div>

      <div>
        <h1>  Click me to disconnect UI</h1>
        <button id='button-root' onClick={handleDisconnectUi}>Disconnect to OKX UI</button>
      </div>


      <div>
        <h1> Click to check status</h1>
        <button id='button-root-check' onClick={checkStatus}>check status</button>
      </div>



      <div>
        <h1> Wallet info</h1>
        <h3 id="wallet-info">{walletText}</h3>
      </div>

      <div>
        <h1> Account info</h1>
        <h3 id="account-info">{accountText}</h3>
      </div>


    </div>
    
  );
}
