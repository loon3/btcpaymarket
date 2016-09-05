var passphraseDialogDecrypt = new BootstrapDialog({
                title: 'Enter Wallet Password',
                closable: false,
                message: $('<div></div>').load('html/dialog-aes.html'),
                buttons: [{
                    id: 'decrypt-passphrase-btn',
                    label: 'Open Wallet',
                    cssClass: 'btn-primary',
                    action: function(dialogItself) {     
                        var passphrase = localStorage.getItem("mnemonic")          
                        var password = dialogItself.getModalBody().find('input').val()
                        //console.log(password)

                        decryptPassphrase(passphrase, password)
                               
                    }
                },
                {
                    label: 'Reset',
                    cssClass: 'btn-danger',
                    action: function(dialogItself) {  
                        
                        var warningMessage = "<div align='center' class='lead' style='padding-top: 15px'>Are you sure you want to reset?</div><div align='center' style='font-weight: bold;'><p>Your wallet will only be recoverable with your<br>twelve-word passphrase.</p></div>"
                        
                        if($("#dialog-aes-content").data("showWarning") == true){
                            
                            $("#dialog-aes-content").data("showWarning", false)
                            resetWallet()
                            
                        } else {
                            
                            $("#dialog-aes-content").html(warningMessage)      
                            $("#dialog-aes-content").data("showWarning", true)
                            $("#decrypt-passphrase-btn").hide()
                            $("#btn-passphrase-dontReset").removeClass("btn-hidden")
                            
                        }
                                  
                    }
                },
                {
                    id: "btn-passphrase-dontReset",
                    label: "Don't Reset",
                    cssClass: 'btn-default btn-hidden',
                    action: function(dialogItself) {  
                        
                        location.reload()
                                  
                    }
                }]
            });

function encryptPassphrase(passphrase, password)
{
    
    var encrypted = CryptoJS.AES.encrypt(passphrase, password);

    console.log(encrypted)

    localStorage.setItem("mnemonic", encrypted);
    localStorage.setItem("encrypted", true);
    sessionStorage.setItem("passphrase", passphrase) 
    initWallet()

}

function decryptPassphrase(passphrase_encrypted, password) 
{
           
    var passphrase_decrypted = CryptoJS.AES.decrypt(passphrase_encrypted, password);          
    var passphrase_decrypted_text = passphrase_decrypted.toString(CryptoJS.enc.Utf8);

    //check if correct password
    if (passphrase_decrypted_text) {            
        sessionStorage.setItem("passphrase", passphrase_decrypted_text) 
        //console.log(passphrase_decrypted_text)
        passphraseDialogDecrypt.close()  
        initWallet()
    } else {
        passphraseDialogDecrypt.enableButtons(false);
        passphraseDialogDecrypt.setMessage('<div align="center">Wrong Password! Refresh page to try again.</div>');
    }
        
}

function newPassphrase()
{
     
    m = new Mnemonic(128);
    m.toWords();
    var str = m.toWords().toString();
    var res = str.replace(/,/gi, " ");
    var phraseList = res; 
    
    return phraseList

}

function checkPassphrase()
{
     
    var mnemonic = localStorage.getItem("mnemonic")
    
    if(!mnemonic){
        
        mnemonic = newPassphrase()       
        localStorage.setItem("mnemonic", mnemonic);
        localStorage.setItem("encrypted", false);
        
        var passphraseDialogInit = new BootstrapDialog({
            title: 'Welcome to BTCPAY Market',
            closable: false,
            message: function(dialog){
                var $message = $('<div></div>').load('html/dialog-passphrase-new.html', function(){
                    $(this).find("#dialogPassphraseNew-passphrase").html(mnemonic)
                })
                
                return $message
            },
            buttons: [{
                label: 'Encrypt',
                cssClass: 'btn-success',
                action: function(dialogItself) {               
                    var manual = dialogItself.getModalBody().find('input').val()
                    if(manual){
                        var wordcount = manual.split(' ').length
                    } else {
                        var wordcount = 12
                    }
                    
                    if (dialogItself.getModalBody().find('input').length && wordcount == 12) {
                        localStorage.setItem("mnemonic", dialogItself.getModalBody().find('input').val());
                    } else {
                        localStorage.setItem("mnemonic", mnemonic)
                    }
                    sessionStorage.setItem("passphrase", mnemonic) 
                    dialogItself.close()
                    passphraseDialogEncrypt.open()
                }
            },
            {
                label: "Don't Encrypt",
                cssClass: 'btn-warning',
                action: function(dialogItself){
                    
                    var manual = dialogItself.getModalBody().find('input').val()
                    if(manual){
                        var wordcount = manual.split(' ').length
                    } else {
                        var wordcount = 12
                    }
                    if (dialogItself.getModalBody().find('input').length) {
                        localStorage.setItem("mnemonic", dialogItself.getModalBody().find('input').val());
                        sessionStorage.setItem("passphrase", dialogItself.getModalBody().find('input').val()) 
                    } else {
                        sessionStorage.setItem("passphrase", mnemonic)   
                    }
                    
                    initWallet()
                    
                    dialogItself.close();
                }
            },
            {
                label: 'Manual',
                cssClass: 'btn-info',
                action: function(dialogItself){
                    
                    $message = $('<div></div>').load('html/dialog-passphrase-manual.html')
                    
                    passphraseDialogInit.setMessage($message);
                    
                    var $button = this; 
                    $button.hide();
                    
                }
            }]
        });
        
        var passphraseDialogEncrypt = new BootstrapDialog({
            title: 'Enter New Wallet Password',
            closable: false,
            message: $('<div></div>').load('html/dialog-aes.html'),
            buttons: [{
                label: 'Encrypt Passphrase',
                cssClass: 'btn-success',
                action: function(dialogItself) {
                    
                    var passphrase = localStorage.getItem("mnemonic")
                    
                    var password = dialogItself.getModalBody().find('input').val();
                    console.log(password);
                    
                    encryptPassphrase(passphrase, password)
                    dialogItself.close()
                }
            }]
        });
            
        passphraseDialogInit.open();
            
    } else {
        
        if(localStorage.getItem("encrypted") == "true"){

            if(!sessionStorage.getItem("passphrase")){
                //passphrase is encrypted, session is not active
                passphraseDialogDecrypt.open();
            } else {
                //passphrase is encrypted, session is still active
                initWallet()
            }
            
        } else {
            
            //passphrase is not encrypted, set session passphrase even if exists
            sessionStorage.setItem("passphrase", localStorage.getItem("mnemonic")) 
            initWallet()
            
        }
        
    }
    
}