import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

const { createApp, nextTick } = Vue;

const app = createApp({
    data() {
        return {
            // Page & UI State
            currentPage: 'home',
            mobileMenuOpen: false,
            appLoading: true,
            loading: false,
            activeTab: 'specs',
            searchLoading: false,
            searchResults: [],
            // Products & Filtering
            products: [],
            selectedCategory: '',
            selectedProduct: null,
            searchQuery: '',
            selectedBrands: [],
            selectedConditions: [],
            priceRange: { min: 0, max: 3000 },
            sortOption: 'price-asc',

            // Product Detail State
            selectedImage: '',
            selectedColor: '',
            productReviews: [],
            productQAs: [],
            newReview: { name: '', rating: 5, text: '' },
            newQuestion: { name: '', text: '' },
            swiper: null,
            activeImageIndex: 0,
            // AI Features
            recommendedProducts: [],
            isGeneratingRecommendations: false,
            selectedForComparison: [],
            showComparisonModal: false,
            comparisonResult: '',
            isComparing: false,
            aiReviewSummary: '',
            isSummarizing: false,
            // Cart & Checkout
            cart: [],
            couponCode: '',
            couponApplied: false,
            couponDiscount: 10,
            selectedCity: 'Blantyre',
            selectedPaymentMethod: 'airtel_money',
            localPaymentMethods: [
                { id: 'airtel_money', name: 'Airtel Money', icon: 'fas fa-mobile-alt' },
                { id: 'tnm_mpamba', name: 'TNM Mpamba', icon: 'fas fa-phone-alt' },
                { id: 'bank_transfer', name: 'Bank Transfer', icon: 'fas fa-university' },
            ],

            // User & Auth
            db: null,
            auth: null,
            userId: null,
            user: null,
            authMode: 'login',
            authForm: { email: '', password: '', confirmPassword: '', role: 'user' },
            authError: '',
            favorites: [],
            viewHistory: [],

            reviews: [
                { id: 1, name: 'Maina Mkandawire', rating: 5, product: 'iPhone 13', text: 'Excellent service and genuine products! I got my iPhone 13 delivered right on time in Lilongwe. Highly recommended.', date: "2024-03-18" },
                { id: 2, name: 'Chisomo Mwale', rating: 5, product: 'Samsung Galaxy A55', text: 'Great phone for a great price. The team was very helpful in answering all my questions before I made the purchase.', date: "2024-03-05" },
                { id: 3, name: 'Limbani Phiri', rating: 4, product: 'HP Spectre x360', text: 'The laptop is powerful and sleek. Works perfectly for my university work. The delivery was fast.', date: "2024-02-20" },
                { id: 4, name: 'Mwayi Zimba', rating: 5, product: 'PlayStation 5', text: 'Finally got my hands on a PS5! Plug Play Tech had it in stock and the transaction was smooth. My weekends are sorted!', date: "2024-02-08" },
                { id: 16, name: 'Temwa Mkandawire', rating: 5, product: 'iPhone 14 Pro Max', text: "I ordered an iPhone 14 Pro Max for my birthday and it was delivered the very next day! The service is impeccable, the phone is genuine, and the entire process was seamless. I love what these guys are doing for tech in Malawi!", date: "2024-05-12" },
                { id: 17, name: 'Pacharo Mushera', rating: 5, product: 'Galaxy S24 Ultra', text: "The AI features on this S24 Ultra are mind-blowing. The team at Plug Play Tech was knowledgeable and helped me choose the perfect device. A truly professional setup.", date: "2024-04-28" },
                { id: 18, name: 'Wongani Mtekera', rating: 5, product: 'MacBook Air M3', text: "This MacBook is a dream for my video editing work. It's incredibly fast and the battery lasts forever. Best tech investment I've made.", date: "2024-04-15" },
                { id: 19, name: 'Chawezi Kamoza', rating: 4, product: 'OnePlus 12', text: "I'm so glad I can finally get OnePlus phones in Malawi! The performance is top-notch and it feels amazing to use. The team was super helpful.", date: "2024-03-30" },
                { id: 20, name: 'Constance Utsale', rating: 4, product: 'iPhone SE', text: "Perfect budget iPhone for my needs. The size is just right and battery lasts all day. Plug Play Tech had the best price in Malawi.", date: "2024-05-10" },
                { id: 21, name: 'Praise Kenamu', rating: 5, product: 'AirPods Pro', text: "These AirPods changed how I listen to music. Noise cancellation is amazing! Delivery was super fast to Lilongwe.", date: "2024-04-22" },
                { id: 22, name: 'Cliff Jabesi', rating: 4, product: 'MacBook Air M3', text: "Lightweight and powerful - perfect for my university studies. The battery really does last all day as advertised.", date: "2024-04-18" },
                { id: 23, name: 'Mwayi Banda', rating: 5, product: 'Galaxy S24 Ultra', text: "The camera on this phone is incredible! I take professional-quality photos without any editing. Best phone I've ever owned.", date: "2024-03-28" },
                { id: 24, name: 'Obert Moyo', rating: 4, product: 'PlayStation 5', text: "My gaming experience has been transformed. The graphics are mind-blowing and load times are non-existent. Worth every kwacha!", date: "2024-03-15" },
                { id: 25, name: 'Alex Kamzere', rating: 5, product: 'iPhone 14 Pro Max', text: "This phone is worth every penny. The display is gorgeous and performance is flawless. Plug Play Tech offered great warranty options too.", date: "2024-02-25" },
                { id: 26, name: 'Joey Dunda', rating: 5, product: 'Samsung Tablet', text: "Perfect tablet for my online classes. The screen size is just right and battery lasts through all my lectures. Great value for money.", date: "2024-05-05" },
                { id: 27, name: 'Mike Joshua', rating: 4, product: 'Apple Watch', text: "Helps me stay active and connected. The health tracking features are surprisingly accurate. Fast delivery to Blantyre.", date: "2024-04-30" },
                { id: 28, name: 'Edward Matheka', rating: 5, product: 'Gaming Laptop', text: "This laptop handles all my games at max settings. The cooling system is excellent even during long gaming sessions. Highly recommended for gamers!", date: "2024-04-10" },
                { id: 29, name: 'Veronica Kachale', rating: 5, product: 'iPhone 15 Pro', text: 'Absolutely thrilled with my purchase. The camera is a game-changer for my business. Customer service was top-notch!', date: "2024-06-10" },
                { id: 30, name: 'Kumbukani Jimu', rating: 4, product: 'Dell XPS 13', text: 'Solid laptop for a developer. Handles all my tasks with ease. Wish it had more ports, but the performance is great.', date: "2024-06-08" },
                { id: 31, name: 'Victor Zumazuma', rating: 5, product: 'Xbox Series S', text: 'Got the Series S for the kids and they love it. Great value and the delivery was surprisingly fast. Thanks Plug Play!', date: "2024-06-05" },
            ]
        };
    },
    computed: {
        cartItemCount() { return this.cart.reduce((total, item) => total + item.quantity, 0); },
        featuredProducts() {
            const ids = [1015, 2017, 3007, 4001, 5001];
            return this.products.filter(p => ids.includes(p.id));
        },
        brands() { return [...new Set(this.products.map(p => p.brand))].sort(); },
        conditions() { return [...new Set(this.products.flatMap(p => p.inventory.map(i => i.condition)))].sort(); },
        maxProductPrice() {
            const prices = this.products.flatMap(p => p.inventory.map(i => i.price));
            return prices.length ? Math.max(...prices) : 3000;
        },
        filteredProducts() {
            let filtered = this.searchResults.length > 0 || this.searchQuery ? this.searchResults : [...this.products];

            if (this.selectedCategory) {
                filtered = filtered.filter(p => p.category === this.selectedCategory);
            }
            if (this.selectedBrands.length > 0) {
                filtered = filtered.filter(p => this.selectedBrands.includes(p.brand));
            }
            if (this.selectedConditions.length > 0) {
                filtered = filtered.filter(p => p.inventory.some(i => this.selectedConditions.includes(i.condition)));
            }

            filtered = filtered.filter(p => {
                const minPrice = this.getMinPrice(p);
                return minPrice >= this.priceRange.min && minPrice <= this.priceRange.max;
            });

            if (this.searchQuery && this.searchResults.length === 0 && !this.searchLoading) {
                return [];
            }
            switch (this.sortOption) {
                case 'price-asc':
                    filtered.sort((a, b) => this.getMinPrice(a) - this.getMinPrice(b));
                    break;
                case 'price-desc':
                    filtered.sort((a, b) => this.getMinPrice(b) - this.getMinPrice(a));
                    break;
                case 'name-asc':
                    filtered.sort((a, b) => a.name.localeCompare(b.name));
                    break;
                case 'name-desc':
                    filtered.sort((a, b) => b.name.localeCompare(a.name));
                    break;
            }

            return filtered;
        },
        subtotalPrice() { return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0); },
        discountAmount() { return this.couponApplied ? Math.round(this.subtotalPrice * (this.couponDiscount / 100)) : 0; },
        shippingCost() { return this.calculateDelivery(this.selectedCity); },
        totalPrice() {
            const subtotalAfterDiscount = this.subtotalPrice - this.discountAmount;
            const localizedSubtotal = this.calculateLocalizedPrice(subtotalAfterDiscount);
            return localizedSubtotal + this.shippingCost;
        }
    },
    watch: {
        viewHistory: { handler: 'generateRecommendations', deep: true },
        favorites: { handler: 'generateRecommendations', deep: true },
        selectedProduct(newVal) {
            if (newVal) {
                this.selectedImage = this.optimizeImage(newVal.images[0], 600);
                this.activeImageIndex = 0;
                if (newVal.colors && newVal.colors.length > 0) {
                    this.selectedColor = newVal.colors[0];
                }
                this.productReviews = this.reviews.filter(r =>
                    r.product.toLowerCase().includes(newVal.name.toLowerCase().split(' ')[0])
                );
                if (this.currentPage === 'productDetail') {
                    nextTick(() => this.initSwiper());
                }
            }
        },
        currentPage(newVal, oldVal) {
            if (newVal === 'productDetail' && this.selectedProduct) {
                nextTick(() => this.initSwiper());
            } else if (oldVal === 'productDetail' && this.swiper) {
                this.swiper.destroy(true, true);
                this.swiper = null;
            }
            if (newVal === 'productList' && !this.searchQuery) {
                this.searchResults = [];
            }
        }
    },
    methods: {
        goHome() { this.currentPage = 'home'; this.selectedCategory = ''; this.mobileMenuOpen = false; },
        setCategory(category) {
            this.selectedCategory = category;
            this.searchQuery = '';
            this.searchResults = [];
            this.currentPage = 'productList';
            this.mobileMenuOpen = false;
            window.scrollTo({ top: 0, behavior: 'smooth' });
        },
        async intelligentSearch() {
            if (!this.searchQuery.trim()) {
                this.searchResults = [];
                this.currentPage = 'productList';
                return;
            }

            this.searchLoading = true;
            this.selectedCategory = '';
            this.searchResults = [];
            await new Promise(resolve => setTimeout(resolve, 1000));

            const keywords = this.searchQuery.toLowerCase().split(' ').filter(k => k);
            const results = this.products.map(product => {
                let matchScore = 0;
                const productText = `${product.name} ${product.brand} ${product.description} ${Object.values(product.specifications || {}).join(' ')}`.toLowerCase();

                keywords.forEach(keyword => {
                    if (productText.includes(keyword)) {
                        matchScore += 1;
                    }
                });

                if (product.name.toLowerCase().includes(this.searchQuery.toLowerCase())) {
                    matchScore += 5;
                }
                return { ...product, matchScore };
            }).filter(item => item.matchScore > 0)
                .sort((a, b) => b.matchScore - a.matchScore);

            this.searchResults = results;
            this.searchLoading = false;
            this.currentPage = 'productList';
        },
        async viewProduct(product) {
            this.loading = true;
            this.aiReviewSummary = '';
            this.activeTab = 'specs';

            if (this.userId) {
                const productIdStr = product.id.toString();
                if (!this.viewHistory.includes(productIdStr)) {
                    this.viewHistory.unshift(productIdStr);
                    if (this.viewHistory.length > 20) this.viewHistory.pop();
                }
            }

            this.selectedProduct = product;
            this.currentPage = 'productDetail';
            this.loading = false;
            window.scrollTo({ top: 0, behavior: 'smooth' });
        },
        async handleAuthForm() {
            this.loading = true;
            this.authError = '';
            try {
                if (this.authMode === 'register') {
                    if (this.authForm.password !== this.authForm.confirmPassword) {
                        throw new Error("Passwords don't match");
                    }
                    let users = JSON.parse(localStorage.getItem('users') || '[]');
                    if (users.find(u => u.email === this.authForm.email)) {
                        throw new Error("Email already registered");
                    }
                    users.push({
                        email: this.authForm.email,
                        password: this.authForm.password,
                        role: this.authForm.role
                    });
                    localStorage.setItem('users', JSON.stringify(users));
                    this.showToast('Registration successful! Please log in.', 'success');
                    this.authMode = 'login';
                    this.authForm = { email: this.authForm.email, password: '', confirmPassword: '', role: 'user' };
                } else {
                    let users = JSON.parse(localStorage.getItem('users') || '[]');
                    let user = users.find(u => u.email === this.authForm.email && u.password === this.authForm.password);
                    if (!user) throw new Error("Invalid email or password");
                    localStorage.setItem('currentUser', JSON.stringify(user));
                    this.user = user;
                    this.userId = user.email;
                    this.showToast('Login successful!', 'success');
                    this.goHome();
                }
            } catch (error) {
                this.authError = error.message;
                this.showToast(error.message, 'error');
            } finally {
                this.loading = false;
            }
        },
        async logout() {
            await signOut(this.auth);
            this.user = null;
            this.userId = null;
            this.cart = [];
            this.favorites = [];
            this.viewHistory = [];
            this.showToast('You have been logged out.');
            this.goHome();
        },
        async generateRecommendations() {
            if (this.isGeneratingRecommendations || !this.userId || (this.viewHistory.length === 0 && this.favorites.length === 0)) return;

            this.isGeneratingRecommendations = true;

            await new Promise(resolve => setTimeout(resolve, 1000));
            const recommendationPool = new Set([...this.viewHistory, ...this.favorites]);
            this.recommendedProducts = this.products
                .filter(p => !recommendationPool.has(p.id.toString()))
                .sort(() => 0.5 - Math.random()) // Randomize
                .slice(0, 4);

            this.isGeneratingRecommendations = false;
        },
        async toggleFavorite(productId) {
            if (!this.userId) { this.showToast('Please log in to use favorites.', 'warning'); this.currentPage = 'account'; return; }

            const idStr = productId.toString();
            const index = this.favorites.indexOf(idStr);
            if (index > -1) {
                this.favorites.splice(index, 1);
                this.showToast('Removed from favorites.');
            } else {
                this.favorites.unshift(idStr);
                this.showToast('Added to favorites!');
            }
        },
        isFavorite(productId) { return this.favorites.includes(productId.toString()); },
        async addToCart(inventoryItem) {
            if (!this.userId) { this.showToast('Please log in to add items to cart', 'warning'); this.currentPage = 'account'; return; }

            inventoryItem.isAdding = true;

            await new Promise(resolve => setTimeout(resolve, 300));
            const existingItem = this.cart.find(item => item.inventoryId === inventoryItem.id);

            if (existingItem) {
                if (existingItem.quantity < inventoryItem.stock) {
                    existingItem.quantity++;
                    this.showToast(`${this.selectedProduct.name} quantity updated!`, 'success');
                } else {
                    this.showToast(`Maximum stock reached.`, 'warning');
                }
            } else {
                this.cart.push({
                    id: 'cart-' + Date.now(),
                    productId: this.selectedProduct.id,
                    name: this.selectedProduct.name,
                    condition: inventoryItem.condition,
                    storage: inventoryItem.storage,
                    price: inventoryItem.price,
                    inventoryId: inventoryItem.id,
                    quantity: 1
                });
                this.showToast(`${this.selectedProduct.name} added to cart!`, 'success');
            }
            inventoryItem.isAdding = false;
        },
        async updateQuantity(cartItem, newQuantity) {
            const quantity = parseInt(newQuantity, 10);
            if (isNaN(quantity) || quantity === cartItem.quantity) { this.$forceUpdate(); return; }

            const stockLimit = this.getInventoryStock(cartItem.inventoryId);
            if (quantity < 1) { this.removeFromCart(cartItem.id); return; }

            if (quantity > stockLimit) {
                this.showToast(`Only ${stockLimit} available.`, 'warning');
                cartItem.quantity = stockLimit;
            } else {
                cartItem.quantity = quantity;
            }
        },
        async removeFromCart(cartItemId) {
            this.cart = this.cart.filter(item => item.id !== cartItemId);
            this.showToast(`Item removed from cart.`, 'warning');
        },
        async removeAllFromCart() {
            this.cart = [];
            this.showToast(`All items removed from cart.`, 'warning');
        },
        async compareProducts() {
            this.isComparing = true;
            this.comparisonResult = '<h3><i class="fas fa-spinner fa-spin"></i> Generating Comparison...</h3><p>Please wait while our AI expert analyzes the products.</p>';
            this.showComparisonModal = true;

            await new Promise(resolve => setTimeout(resolve, 1500));
            const productsToCompare = this.products.filter(p => this.selectedForComparison.includes(p.id));

            const allKeys = [...new Set(productsToCompare.flatMap(p => Object.keys(p.specifications)))];
            let table = '<table class="min-w-full"><thead><tr><th class="px-4 py-2">Feature</th>';
            productsToCompare.forEach(p => { table += `<th class="px-4 py-2">${p.name}</th>`; });
            table += '</tr></thead><tbody>';

            allKeys.forEach(spec => {
                table += `<tr><td class="border px-4 py-2 font-bold">${spec}</td>`;
                productsToCompare.forEach(p => {
                    table += `<td class="border px-4 py-2">${p.specifications[spec] || 'N/A'}</td>`;
                });
                table += '</tr>';
            });

            table += `<tr><td class="border px-4 py-2 font-bold">Price (MWK)</td>`;
            productsToCompare.forEach(p => { table += `<td class="border px-4 py-2">From ${this.calculateLocalizedPrice(this.getMinPrice(p)).toLocaleString()}</td>`; });
            table += '</tr></tbody></table>';

            this.comparisonResult = `<h3 class="text-xl font-bold mb-4">Product Comparison</h3>${table}`;
            this.isComparing = false;
        },
        async summarizeReviews(product) {
            this.isSummarizing = true;
            this.aiReviewSummary = '<p><i class="fas fa-spinner fa-spin"></i> Summarizing reviews...</p>';

            await new Promise(resolve => setTimeout(resolve, 1500));
            this.aiReviewSummary = `
                        <h4 class="font-bold mb-2">What Customers Loved:</h4>
                        <ul class="list-disc pl-5 mb-4 font-sans space-y-1">
                            <li>Excellent battery life that lasts all day</li>
                            <li>Fast performance for multitasking</li>
                            <li>High-quality camera for photos and videos</li>
                            <li>Premium design and build quality</li>
                        </ul>
                        <h4 class="font-bold mb-2">What Customers Noted:</h4>
                        <ul class="list-disc pl-5 font-sans space-y-1">
                            <li>Device can get warm during intensive tasks</li>
                            <li>Charger not included in the box</li>
                        </ul>
                    `;
            this.isSummarizing = false;
        },
        submitReview() {
            if (!this.newReview.name || !this.newReview.text) { this.showToast('Please fill all fields', 'error'); return; }

            const review = {
                id: Date.now(),
                name: this.newReview.name,
                rating: this.newReview.rating,
                product: this.selectedProduct.name,
                text: this.newReview.text,
                date: new Date().toISOString().split('T')[0]
            };

            this.reviews.unshift(review);
            this.productReviews.unshift(review);
            this.newReview = { name: '', rating: 5, text: '' };
            this.showToast('Review submitted successfully!', 'success');
        },
        submitQuestion() {
            if (!this.newQuestion.name || !this.newQuestion.text) { this.showToast('Please fill all fields', 'error'); return; }

            const qa = {
                question: this.newQuestion.text,
                asker: this.newQuestion.name,
                date: new Date().toISOString().split('T')[0],
                answer: "Thank you for your question! Our support team will respond within 24 hours."
            };

            this.productQAs.unshift(qa);
            this.newQuestion = { name: '', text: '' };
            this.showToast('Question submitted successfully!', 'success');
        },
        clearFilters() {
            this.selectedBrands = [];
            this.selectedConditions = [];
            this.priceRange = { min: 0, max: this.maxProductPrice };
            this.searchQuery = '';
            this.searchResults = [];
        },
        getInventoryStock(inventoryId) {
            const item = this.products.flatMap(p => p.inventory).find(i => i.id === inventoryId);
            return item ? item.stock : 0;
        },
        getProductImage(productId) {
            const p = this.products.find(p => p.id === productId);
            return p ? p.images[0] : `https://placehold.co/100x100/e2e8f0/e2e8f0?text=Img`;
        },
        getMinPrice(product) {
            if (!product || !product.inventory || product.inventory.length === 0) return 0;
            return Math.min(...product.inventory.map(item => item.price));
        },
        getMaxStock(product) {
            if (!product || !product.inventory || product.inventory.length === 0) return 0;
            return product.inventory.reduce((total, item) => total + item.stock, 0);
        },
        applyCoupon() {
            if (this.couponCode.toUpperCase() === 'STUDENT10') {
                this.couponApplied = true;
                this.showToast('Coupon applied successfully!', 'success');
            } else {
                this.showToast('Invalid coupon code', 'error');
            }
        },
        calculateLocalizedPrice(basePriceUSD) {
            const exchangeRate = 1750; // MWK to USD
            const landedCostMultiplier = 1.25; // 25% for import duty, VAT, and margin
            if (!basePriceUSD) return 0;
            const finalPrice = basePriceUSD * exchangeRate * landedCostMultiplier;
            return Math.round(finalPrice / 1000) * 1000; // Round to nearest 1000 MWK
        },
        calculateDelivery(city) {
            const deliveryMatrix = {
                'Blantyre': 15000,
                'Lilongwe': 18000,
                'Mzuzu': 25000,
                'Zomba': 20000,
                'Other': 30000
            };
            return deliveryMatrix[city] || deliveryMatrix.Other;
        },
        optimizeImage(url, width = 600) {
            if (!url) return '';
            // For placeholder images, just replace the size
            if (url.includes('placehold.co')) {
                return url.replace(/\/[0-9]+x[0-9]+/, `/${width}x${width}`);
            }
            // In a real app, this would point to an image CDN like Cloudinary
            return url;
        },
        showToast(message, type = 'success') {
            const toast = document.createElement('div');
            const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-yellow-500';
            const icon = type === 'success' ? 'fa-check-circle' : type === 'error' ? 'fa-exclamation-triangle' : 'fa-info-circle';
            toast.className = `fixed bottom-4 right-4 px-6 py-4 rounded-lg shadow-lg text-white z-50 transition-all duration-300 transform translate-y-full font-sans ${bgColor}`;
            toast.innerHTML = `<div class="flex items-center"><i class="fas ${icon} mr-3"></i><span>${message}</span></div>`;
            document.body.appendChild(toast);

            setTimeout(() => { toast.style.transform = 'translateY(0)'; }, 100);
            setTimeout(() => {
                toast.style.transform = 'translateY(150%)';
                setTimeout(() => toast.remove(), 300);
            }, 3000);
        },
        initLazyLoading() {
            const lazyImages = document.querySelectorAll('.lazy-img:not(.loaded)');
            if ('IntersectionObserver' in window) {
                let observer = new IntersectionObserver((entries, observer) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            let img = entry.target;
                            img.src = img.dataset.src;
                            img.classList.add('loaded');
                            observer.unobserve(img);
                        }
                    });
                });
                lazyImages.forEach(img => observer.observe(img));
            } else { // Fallback for older browsers
                lazyImages.forEach(img => {
                    img.src = img.dataset.src;
                    img.classList.add('loaded');
                });
            }
        },
        initSwiper() {
            if (this.swiper) {
                this.swiper.destroy(true, true);
                this.swiper = null;
            }
            this.swiper = new Swiper('.swiper-container', {
                loop: true,
                navigation: {
                    nextEl: '.swiper-button-next',
                    prevEl: '.swiper-button-prev',
                },
                on: {
                    slideChange: () => {
                        this.activeImageIndex = this.swiper.realIndex;
                    }
                }
            });
        },
        initializeFirebase() {
            try {
                if (typeof __firebase_config !== 'undefined' && __firebase_config) {
                    const firebaseConfig = JSON.parse(__firebase_config);
                    const app = initializeApp(firebaseConfig);
                    this.auth = getAuth(app);
                    onAuthStateChanged(this.auth, async (user) => {
                        if (user) {
                            this.user = user;
                            this.userId = user.uid;
                        } else {
                            if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
                                try {
                                    await signInWithCustomToken(this.auth, __initial_auth_token);
                                } catch (e) {
                                    console.error("Custom token sign-in failed, falling back to anonymous.", e);
                                    await signInAnonymously(this.auth);
                                }
                            } else {
                                await signInAnonymously(this.auth);
                            }
                        }
                        this.appLoading = false;
                    });
                } else {
                    console.warn("Firebase config not found. Using simulated auth.");
                    this.appLoading = false;
                }
            } catch (error) {
                console.error("Firebase initialization failed:", error);
                this.authError = "Could not connect to authentication service.";
                this.appLoading = false;
            }
        },
        populateProductData() {
            // Prices are now Base Prices in USD
            this.products = [
                // APPLE iPHONES
                {
                    id: 1012,
                    name: "iPhone 14 Pro Max",
                    brand: "Apple",
                    category: "Apple Products",
                    description: "The ultimate iPhone with a stunning 6.7-inch display and revolutionary camera system.",
                    images: [
                        "https://images.unsplash.com/photo-1661961112951-7b7b7b7b7b7b?auto=format&fit=crop&w=600&q=80", // iPhone 14 Pro Max front
                        "https://images.unsplash.com/photo-1661961112951-7b7b7b7b7b7b?auto=format&fit=crop&w=600&q=80", // iPhone 14 Pro Max back (use same or find another)
                        "https://images.unsplash.com/photo-1661961112951-7b7b7b7b7b7b?auto=format&fit=crop&w=600&q=80"  // iPhone 14 Pro Max side
                    ],
                    colors: ["#5e4da8", "#424245", "#f1f2ed"],
                    inventory: [{ id: 10121, condition: "New", storage: "128GB", price: 999, stock: 8 }, { id: 10122, condition: "New", storage: "256GB", price: 1099, stock: 5 }],
                    specifications: { "Display": "6.7-inch Super Retina XDR with Dynamic Island", "Processor": "A16 Bionic", "Camera": "48MP Main + 12MP Ultra Wide + 12MP Telephoto", "OS": "iOS 16" }
                },
                {
                    id: 1015,
                    name: "iPhone 15 Pro Max",
                    brand: "Apple",
                    category: "Apple Products",
                    description: "The most advanced iPhone with titanium design and powerful camera system.",
                    images: [
                        "https://images.unsplash.com/photo-1694700981234-iphone15promax?auto=format&fit=crop&w=600&q=80",
                        "https://images.unsplash.com/photo-1694700981234-iphone15promax-back?auto=format&fit=crop&w=600&q=80",
                        "https://images.unsplash.com/photo-1694700981234-iphone15promax-side?auto=format&fit=crop&w=600&q=80"
                    ],
                    colors: ["#8a817c", "#3c3c3c", "#f0f0f0"],
                    inventory: [{ id: 10151, condition: "New", storage: "256GB", price: 1199, stock: 9 }, { id: 10152, condition: "New", storage: "512GB", price: 1399, stock: 6 }, { id: 10153, condition: "Refurbished", storage: "256GB", price: 950, stock: 4 }],
                    specifications: { "Display": "6.7-inch Super Retina XDR with ProMotion", "Processor": "A17 Pro chip", "Camera": "48MP Main + 12MP Ultra Wide + 12MP 5x Telephoto", "OS": "iOS 17" }
                },
                {
                    id: 2017,
                    name: "Galaxy S24 Ultra",
                    brand: "Samsung",
                    category: "Samsung Products",
                    description: "Samsung's flagship with S Pen and AI-powered camera.",
                    images: [
                        "https://images.samsung.com/is/image/samsung/p6pim/levant/2401/gallery/levant-galaxy-s24-ultra-sm-s928bzkgmea-thumb-539663290?$650_519_PNG$",
                        "https://images.samsung.com/is/image/samsung/p6pim/levant/2401/gallery/levant-galaxy-s24-ultra-sm-s928bzkgmea-thumb-539663290-2?$650_519_PNG$",
                        "https://images.samsung.com/is/image/samsung/p6pim/levant/2401/gallery/levant-galaxy-s24-ultra-sm-s928bzkgmea-thumb-539663290-3?$650_519_PNG$"
                    ],
                    colors: ["#212121", "#5c7f67", "#7d5260"],
                    inventory: [{ id: 20171, condition: "New", storage: "256GB", price: 1299, stock: 8 }],
                    specifications: { "Display": "6.8-inch Dynamic AMOLED 2X", "Processor": "Snapdragon 8 Gen 3 for Galaxy", "Camera": "200MP + 50MP + 10MP + 12MP quad camera", "OS": "Android 14" }
                },
                {
                    id: 2024,
                    name: "Galaxy A55",
                    brand: "Samsung",
                    category: "Samsung Products",
                    description: "Premium mid-range smartphone with flagship features at an affordable price.",
                    images: [
                        "https://images.samsung.com/is/image/samsung/p6pim/levant/2403/gallery/levant-galaxy-a55-5g-sm-a556blbamea-thumb-539663290?$650_519_PNG$",
                        "https://images.samsung.com/is/image/samsung/p6pim/levant/2403/gallery/levant-galaxy-a55-5g-sm-a556blbamea-thumb-539663290-2?$650_519_PNG$",
                        "https://images.samsung.com/is/image/samsung/p6pim/levant/2403/gallery/levant-galaxy-a55-5g-sm-a556blbamea-thumb-539663290-2?$650_519_PNG$"
                    ],
                    colors: ["#0a2540", "#f9f6f2"],
                    inventory: [{ id: 20241, condition: "New", storage: "128GB", price: 449, stock: 12 }],
                    specifications: { "Display": "6.6-inch Super AMOLED 120Hz", "Processor": "Exynos 1480", "Camera": "50MP triple camera with OIS", "OS": "Android 14" }
                },

                // OTHER SMARTPHONES
                {
                    id: 3001,
                    name: "Pixel 8",
                    brand: "Google",
                    category: "Other Smartphones",
                    description: "Google's flagship with advanced AI camera features and pure Android experience.",
                    images: [
                        "https://store.google.com/product/images/phone_pixel_8_front.png",
                    ],
                    colors: ["#1e3a8a", "#0f766e"],
                    inventory: [{ id: 30071, condition: "New", storage: "256GB", price: 799, stock: 5 }],
                    specifications: { "Display": "6.82-inch Fluid AMOLED", "Processor": "Snapdragon 8 Gen 3", "Camera": "50MP + 48MP + 64MP triple camera", "OS": "OxygenOS 14" }
                },

                // LAPTOPS
                {
                    id: 4001,
                    name: "MacBook Air M3",
                    brand: "Apple",
                    category: "Laptops",
                    description: "Ultra-thin laptop with Apple's powerful M3 chip and all-day battery life.",
                    images: [
                        "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/macbook-air-13-m3-hero-202402?wid=600&hei=600&fmt=jpeg&qlt=90&.v=1707332189647",
                        "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/macbook-air-13-m3-gallery1-202402?wid=600&hei=600&fmt=jpeg&qlt=90&.v=1707332189647",
                        "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/macbook-air-13-m3-hero-202402?wid=600&hei=600&fmt=jpeg&qlt=90&.v=1707332189647",
                        "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/macbook-air-13-m3-gallery1-202402?wid=600&hei=600&fmt=jpeg&qlt=90&.v=1707332189647",
                        "https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/macbook-air-13-m3-gallery2-202402?wid=600&hei=600&fmt=jpeg&qlt=90&.v=1707332189647"
                    ],
                    colors: ["#545453", "#f0e6d6", "#a2aaad"],
                    inventory: [{ id: 40011, condition: "New", storage: "256GB SSD", price: 999, stock: 5 }, { id: 40012, condition: "Refurbished", storage: "256GB SSD", price: 799, stock: 3 }],
                    specifications: { "Display": "13.6-inch Liquid Retina", "Processor": "Apple M3 chip", "Memory": "8GB Unified Memory", "OS": "macOS" }
                },
                {
                    id: 4005,
                    name: "Dell XPS 13",
                    brand: "Dell",
                    category: "Laptops",
                    description: "Premium Windows laptop with InfinityEdge display and powerful performance.",
                    images: [
                        "https://i.dell.com/sites/csimages/Video_Imagery/all/xps-13-9310-laptop-pdp-mod1.jpg",
                        "https://i.dell.com/sites/csimages/Video_Imagery/all/xps-13-9310-laptop-pdp-mod2.jpg"
                    ],
                    colors: ["#a2aaad", "#e1e3e4"],
                    inventory: [{ id: 40051, condition: "New", storage: "512GB SSD", price: 1299, stock: 4 }],
                    specifications: { "Display": "13.4-inch FHD+ InfinityEdge", "Processor": "Intel Core i7", "Memory": "16GB LPDDR5", "OS": "Windows 11" }
                },

                // GAMING CONSOLES
                {
                    id: 5001,
                    name: "PlayStation 5 Standard",
                    brand: "Sony",
                    category: "Gaming Consoles",
                    description: "Next-gen gaming console with lightning-fast loading and immersive gaming experiences.",
                    images: [
                        "https://images.unsplash.com/photo-1606813909355-6c2b7b7b7b7b?auto=format&fit=crop&w=600&q=80"
                    ],
                    colors: ["#ffffff"],
                    inventory: [{ id: 50011, condition: "New", storage: "825GB", price: 499, stock: 8 }],
                    specifications: { "CPU": "8x Cores @ 3.5GHz (Zen 2)", "GPU": "10.28 TFLOPs, 36 CUs @ 2.23GHz", "Storage": "825GB SSD" }
                },
                {
                    id: 5004,
                    name: "Xbox Series X",
                    brand: "Microsoft",
                    category: "Gaming Consoles",
                    description: "The fastest, most powerful Xbox ever with next-gen performance.",
                    images: [
                        "https://images.unsplash.com/photo-1606813909355-6c2b7b7b7b7b?auto=format&fit=crop&w=600&q=80"
                    ],
                    colors: ["#000000"],
                    inventory: [{ id: 50041, condition: "New", storage: "1TB", price: 499, stock: 6 }],
                    specifications: { "CPU": "8x Cores @ 3.8 GHz (Zen 2)", "GPU": "12 TFLOPS, 52 CUs @ 1.825 GHz", "Storage": "1TB Custom NVME SSD" }
                },

                // ACCESSORIES
                {
                    id: 6001,
                    name: "iPhone Lightning Charger",
                    brand: "Apple",
                    category: "Accessories",
                    description: "Original Apple Lightning charging cable for all iPhone models.",
                    images: [
                        "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80"
                    ],
                    colors: [],
                    inventory: [{ id: 60011, condition: "New", storage: "N/A", price: 19, stock: 50 }],
                    specifications: { "Type": "Charger Cable", "Connector": "Lightning to USB-A" }
                },
                {
                    id: 6003,
                    name: "USB-C PD Charger 65W",
                    brand: "Anker",
                    category: "Accessories",
                    description: "Powerful 65W USB-C Power Delivery charger for laptops and phones.",
                    images: [
                        "https://images.anker.com/anker-65w-charger.jpg"
                    ],
                    colors: [],
                    inventory: [{ id: 60031, condition: "New", storage: "N/A", price: 35, stock: 30 }],
                    specifications: { "Type": "Power Adapter", "Wattage": "65W" }
                }
            ];

            // 1. Add new iPhones not in your current list
            this.products.push(
                // iPhone X Series
                {
                    id: 1101,
                    name: "iPhone X",
                    brand: "Apple",
                    category: "Apple Products",
                    description: "Apple's first all-screen iPhone with Face ID.",
                    images: [
                        "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80"
                    ],
                    colors: ["#222", "#fff"],
                    inventory: [
                        { id: 11011, condition: "Refurbished", storage: "64GB", price: 231, stock: 3 }, // 405000 / 1750
                        { id: 11012, condition: "Refurbished", storage: "256GB", price: 259, stock: 2 } // 453000 / 1750
                    ],
                    specifications: { "Display": "5.8-inch Super Retina", "Processor": "A11 Bionic", "Camera": "12MP Dual", "OS": "iOS" }
                },
                // iPhone 11 Series
                {
                    id: 1102,
                    name: "iPhone 11",
                    brand: "Apple",
                    category: "Apple Products",
                    description: "Dual-camera system and all-day battery life.",
                    images: [
                        "https://images.unsplash.com/photo-1573152958734-1922c1e8e4c5?auto=format&fit=crop&w=600&q=80"
                    ],
                    colors: ["#222", "#fff", "#f1c40f"],
                    inventory: [
                        { id: 11021, condition: "Refurbished", storage: "64GB", price: 224, stock: 4 }, // 392000 / 1750
                        { id: 11022, condition: "Refurbished", storage: "128GB", price: 239, stock: 3 }, // 418000 / 1750
                        { id: 11023, condition: "Refurbished", storage: "256GB", price: 254, stock: 2 } // 445000 / 1750
                    ],
                    specifications: { "Display": "6.1-inch Liquid Retina", "Processor": "A13 Bionic", "Camera": "12MP Dual", "OS": "iOS" }
                },
                // iPhone 11 Pro
                {
                    id: 1103,
                    name: "iPhone 11 Pro",
                    brand: "Apple",
                    category: "Apple Products",
                    description: "Triple-camera system and Super Retina XDR display.",
                    images: [
                        "https://images.unsplash.com/photo-1573152958734-1922c1e8e4c5?auto=format&fit=crop&w=600&q=80"
                    ],
                    colors: ["#222", "#fff", "#b2bec3"],
                    inventory: [
                        { id: 11031, condition: "Refurbished", storage: "64GB", price: 262, stock: 2 }, // 458000 / 1750
                        { id: 11032, condition: "Refurbished", storage: "256GB", price: 276, stock: 2 },// 484000 / 1750
                        { id: 11033, condition: "Refurbished", storage: "512GB", price: 284, stock: 1 } // 497000 / 1750
                    ],
                    specifications: { "Display": "5.8-inch Super Retina XDR", "Processor": "A13 Bionic", "Camera": "12MP Triple", "OS": "iOS" }
                },
                // iPhone 12 Series
                {
                    id: 1104,
                    name: "iPhone 12",
                    brand: "Apple",
                    category: "Apple Products",
                    description: "5G speed and A14 Bionic chip.",
                    images: [
                        "https://images.unsplash.com/photo-1603898037225-1c1e6c1e6c1e?auto=format&fit=crop&w=600&q=80"
                    ],
                    colors: ["#222", "#fff", "#f1c40f"],
                    inventory: [
                     { id: 11041, condition: "Refurbished", storage: "64GB", price: 239, stock: 3 }, // 418000 / 1750
                     { id: 11042, condition: "Refurbished", storage: "128GB", price: 254, stock: 2 }, // 445000 / 1750
                     { id: 11043, condition: "Refurbished", storage: "256GB", price: 276, stock: 2 } // 484000 / 1750
                    ],
                    specifications: { "Display": "6.1-inch Super Retina XDR", "Processor": "A14 Bionic", "Camera": "12MP Dual", "OS": "iOS" }
                },
                // iPhone 12 Pro
                {
                    id: 1105,
                    name: "iPhone 12 Pro",
                    brand: "Apple",
                    category: "Apple Products",
                    description: "Pro camera system and LiDAR scanner.",
                    images: [
                        "https://images.unsplash.com/photo-1603898037225-1c1e6c1e6c1e?auto=format&fit=crop&w=600&q=80"
                    ],
                    colors: ["#222", "#fff", "#b2bec3"],
                    inventory: [
                     { id: 11051, condition: "Refurbished", storage: "128GB", price: 284, stock: 2 }, // 497000 / 1750
                     { id: 11052, condition: "Refurbished", storage: "256GB", price: 306, stock: 1 }, // 536000 / 1750
                     { id: 11053, condition: "Refurbished", storage: "512GB", price: 322, stock: 1 } // 563000 / 1750
                    ],
                    specifications: { "Display": "6.1-inch Super Retina XDR", "Processor": "A14 Bionic", "Camera": "12MP Triple", "OS": "iOS" }
                },
                // iPhone 12 Pro Max
                {
                    id: 1106,
                    name: "iPhone 12 Pro Max",
                    brand: "Apple",
                    category: "Apple Products",
                    description: "Largest display and best camera in the 12 series.",
                    images: [
                        "https://images.unsplash.com/photo-1603898037225-1c1e6c1e6c1e?auto=format&fit=crop&w=600&q=80"
                    ],
                    colors: ["#222", "#fff", "#b2bec3"],
                    inventory: [
                       { id: 11061, condition: "Refurbished", storage: "128GB", price: 299, stock: 2 }, // 523000 / 1750
                       { id: 11062, condition: "Refurbished", storage: "256GB", price: 322, stock: 1 }, // 563000 / 1750
                       { id: 11063, condition: "Refurbished", storage: "512GB", price: 337, stock: 1 } // 589000 / 1750
                    ],
                    specifications: { "Display": "6.7-inch Super Retina XDR", "Processor": "A14 Bionic", "Camera": "12MP Triple", "OS": "iOS" }
                }
                // ...continue for other missing models as needed...
            );

            // 2. Update prices for products already in your list (example for iPhone 14 Pro Max)
            const updatePrice = (productName, storage, newPrice) => {
                const product = this.products.find(p => p.name === productName);
                if (product) {
                    const item = product.inventory.find(i => i.storage === storage);
                    if (item) item.price = newPrice;
                }
            };
            // Example: update iPhone 14 Pro Max prices
            updatePrice("iPhone 14 Pro Max", "256GB", 1485000);
            // ...repeat for other models as needed...

            // 3. Add Samsung, Pixel, OnePlus, etc. not in your list, using the same format as above.
            // Example for Galaxy S10:
            this.products.push(
                {
                    id: 2101,
                    name: "Galaxy S10",
                    brand: "Samsung",
                    category: "Samsung Products",
                    description: "Infinity-O Display and pro-grade camera.",
                    images: [
                        "https://images.samsung.com/is/image/samsung/p6pim/levant/galaxy-s10-sm-g973-sm-g973fzwdmea-frontwhite-thumb-156464021?$650_519_PNG$"
                    ],
                    colors: ["#fff", "#222"],
                    inventory: [
                                { id: 21011, condition: "Refurbished", storage: "128GB", price: 170, stock: 2 }, // 298000 / 1750
                                { id: 21012, condition: "Refurbished", storage: "256GB", price:209, stock: 1 } // 365000 / 1750
                    ],
                    specifications: { "Display": "6.1-inch Dynamic AMOLED", "Processor": "Exynos 9820", "Camera": "16MP Triple", "OS": "Android" }
                }
                // ...continue for other missing Samsung models...
            );

            // 4. Repeat for other brands and accessories as needed, using your price list and Unsplash/Pexels/official images.
        }
    },
    mounted() {
        this.populateProductData();
        this.initializeFirebase();

        nextTick(() => {
            this.initLazyLoading();
            // Set initial price range max based on populated products
            this.priceRange.max = this.maxProductPrice;
        });
    },
    updated() {
        nextTick(() => { this.initLazyLoading(); });
    }
});

app.mount('#app');