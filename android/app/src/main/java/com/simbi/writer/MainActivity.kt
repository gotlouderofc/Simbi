package com.simbi.writer

import android.app.Activity
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.view.KeyEvent
import android.webkit.ValueCallback
import android.webkit.WebChromeClient
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Toast
import androidx.activity.OnBackPressedCallback
import androidx.appcompat.app.AppCompatActivity

class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView
    private var fileUploadCallback: ValueCallback<Array<Uri>>? = null
    private val FILE_CHOOSER_REQUEST_CODE = 412

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Create standard high-performance WebView
        webView = WebView(this)
        setContentView(webView)

        setupWebViewSettings()
        setupWebViewClients()
        setupBackPressed()

        // Load the hosted Simbi Web Application URL
        webView.loadUrl("https://simbi-kappa.vercel.app")
    }

    private fun setupWebViewSettings() {
        val settings = webView.settings
        
        // Critical permissions & performance traits
        settings.javaScriptEnabled = true
        settings.domStorageEnabled = true
        settings.databaseEnabled = true
        
        // General usability controls
        settings.allowFileAccess = true
        settings.allowContentAccess = true
        settings.loadWithOverviewMode = true
        settings.useWideViewPort = true
        settings.supportZoom()
        settings.builtInZoomControls = false // Keep native touch zoom disabled in favor of app's inside tools
        settings.displayZoomControls = false

        // Cache mode for amazing offline PWA capabilities
        settings.cacheMode = WebSettings.LOAD_DEFAULT

        // Modern App Identity User Agent
        val originalUA = settings.userAgentString
        settings.userAgentString = "$originalUA SimbiAndroidWrapper/1.0"
    }

    private fun setupWebViewClients() {
        // Keeps user inside the WebView rather than launching systemic browsers
        webView.webViewClient = object : WebViewClient() {
            @Deprecated("Deprecated in Java")
            override fun shouldOverrideUrlLoading(view: WebView?, url: String?): Boolean {
                if (url != null && (url.startsWith("http://") || url.startsWith("https://"))) {
                    view?.loadUrl(url)
                    return true
                }
                return false
            }
        }

        // WebChromeClient supports system alerts, consoles, and critically, FILE UPLOADS/IMPORTS
        webView.webChromeClient = object : WebChromeClient() {
            override fun onShowFileChooser(
                webView: WebView?,
                filePathCallback: ValueCallback<Array<Uri>>?,
                fileChooserParams: FileChooserParams?
            ): Boolean {
                // Cancel any previous pending import callbacks
                fileUploadCallback?.onReceiveValue(null)
                fileUploadCallback = filePathCallback

                // Fire custom document pick Intent
                val intent = Intent(Intent.ACTION_GET_CONTENT).apply {
                    addCategory(Intent.CATEGORY_OPENABLE)
                    type = "*/*" // Allow JSON, .simbidoc files, images
                }
                
                try {
                    startActivityForResult(
                        Intent.createChooser(intent, "Choose Simbi Document File"),
                        FILE_CHOOSER_REQUEST_CODE
                    )
                } catch (e: Exception) {
                    fileUploadCallback?.onReceiveValue(null)
                    fileUploadCallback = null
                    Toast.makeText(this@MainActivity, "File Browser not available", Toast.LENGTH_LONG).show()
                    return false
                }
                return true
            }
        }
    }

    private fun setupBackPressed() {
        // Modern Android back callback. If the WebView can go backward, do so.
        onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
            override fun handleOnBackPressed() {
                if (webView.canGoBack()) {
                    webView.goBack()
                } else {
                    // Temporarily disable this callback and default back so it closes properly
                    isEnabled = false
                    onBackPressedDispatcher.onBackPressed()
                    isEnabled = true
                }
            }
        })
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)
        if (requestCode == FILE_CHOOSER_REQUEST_CODE) {
            if (fileUploadCallback == null) return
            
            val result = if (resultCode == Activity.RESULT_OK && data != null) {
                // Collect chosen content URI
                val dataString = data.dataString
                val clipData = data.clipData
                if (clipData != null) {
                    val count = clipData.itemCount
                    Array(count) { clipData.getItemAt(it).uri }
                } else if (dataString != null) {
                    arrayOf(Uri.parse(dataString))
                } else {
                    null
                }
            } else {
                null
            }
            
            fileUploadCallback?.onReceiveValue(result)
            fileUploadCallback = null
        }
    }
}
