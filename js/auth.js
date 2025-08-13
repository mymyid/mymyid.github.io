// Cek apakah user sudah login
export function isAuthenticated() {
    // Method 1: Gunakan Puter SDK
    if (typeof puter !== 'undefined' && puter.auth) {
        return puter.auth.isSignedIn();
    }
    
    // Method 2: Cek token manual
    const token = localStorage.getItem('puter.auth.token');
    return !!token && token !== 'null';
}

// Cara termudah
export async function getUserInfo() {
    try {
        const user = await puter.auth.getUser();
        console.log('User:', user);
        return user;
    } catch (error) {
        console.error('Not authenticated:', error);
        return null;
    }
}

export async function loginUser() {
    try {
        // Cek apakah puter tersedia
        if (typeof puter === 'undefined' || !puter.auth) {
            throw new Error('Puter SDK not available');
        }

        // Akan membuka popup login
        const result = await puter.auth.signIn();
        if (result && (result.success !== false)) {
            console.log('Login berhasil!', result);
            
            // Callback jika ada
            if (typeof onLoginSuccess === 'function') {
                onLoginSuccess(result);
            }
            
            return {
                success: true,
                user: result
            };
        } else {
            console.log('❌ Login gagal:', result);
            return {
                success: false,
                error: result.error || 'Login failed'
            };
        }

    } catch (error) {
        console.error('Login gagal:', error);
        // 🔧 PERBAIKAN: Handle berbagai jenis error
        if (error.message?.includes('cancelled') || error.message?.includes('closed')) {
            console.log('Login dibatalkan oleh user');
            return {
                success: false,
                error: 'Login cancelled by user',
                cancelled: true
            };
        }
        
        return {
            success: false,
            error: error.message || 'Login failed'
        };
    }
}


export function logoutUser() {
    try {
        // Method 1: Dengan Puter SDK
        if (typeof puter !== 'undefined' && puter.auth) {
            puter.auth.signOut();
        }
        
        // Method 2: Manual cleanup
        localStorage.removeItem('puter.auth.token');
        localStorage.removeItem('puter.app.id');
        
        console.log('Logout berhasil');
        
        // 🔧 PERBAIKAN: Optional reload - biarkan developer yang tentukan
        // window.location.reload();
        
        return true;
        
    } catch (error) {
        console.error('Logout error:', error);
        return false;
    }
}

export function signInWithRedirect() {
    const returnUrl = window.location.href;
    const authUrl = `https://puter.com/login?redirect_uri=${encodeURIComponent(returnUrl)}`;
    
    console.log('Redirecting to Puter login...');
    window.location.href = authUrl;
}

// Handle return dari redirect
export function handleAuthReturn() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (token) {
        localStorage.setItem('puter.auth.token', token);
        puter.setAuthToken(token);
        
        // Clean up URL
        window.history.replaceState({}, document.title, window.location.pathname);
        
        console.log('Authentication successful');
        return true;
    }
    
    return false;
}




