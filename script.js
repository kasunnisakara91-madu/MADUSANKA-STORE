
        // Firebase configuration
        /*const firebaseConfig = {
            apiKey: "AIzaSyDulliK5zrr2U-0Hl9EzrWrojka1VxodOk",
            authDomain: "free-code-bf1c2.firebaseapp.com",
            databaseURL: "https://free-code-bf1c2-default-rtdb.firebaseio.com",
            projectId: "free-code-bf1c2",
            storageBucket: "free-code-bf1c2.firebasestorage.app",
            messagingSenderId: "8313552650",
            appId: "1:8313552650:web:b370e1dc3f608c819104f3",
            measurementId: "G-W4JQLJ8RYR"
        };*/
        
        
   // For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyC9WKZmrQENcKl4ONjHNDp46pDehjy0Ws4",
    authDomain: "madusanka-fc517.firebaseapp.com",
    projectId: "madusanka-fc517",
    storageBucket: "madusanka-fc517.firebasestorage.app",
    messagingSenderId: "923483175287",
    appId: "1:923483175287:web:a6b04d98c0e49606944972",
    measurementId: "G-DQCJLHT8LY"
};

        
        // Initialize Firebase
        firebase.initializeApp(firebaseConfig);
        const database = firebase.database();
        
        // DOM Elements
        const adminLoginBtn = document.getElementById('adminLoginBtn');
        const loginModal = document.getElementById('loginModal');
        const closeModal = document.getElementById('closeModal');
        const loginSubmit = document.getElementById('loginSubmit');
        const loginMessage = document.getElementById('loginMessage');
        const photoGallery = document.getElementById('photoGallery');
        const visitorCount = document.getElementById('visitorCount');
        const totalVisits = document.getElementById('totalVisits');
        const adminPanel = document.getElementById('adminPanel');
        const closeAdminPanel = document.getElementById('closeAdminPanel');
        const adminImageUrl = document.getElementById('adminImageUrl');
        const adminImageAlt = document.getElementById('adminImageAlt');
        const adminAddImageBtn = document.getElementById('adminAddImageBtn');
        const imageList = document.getElementById('imageList');
        const imagePreview = document.getElementById('imagePreview');
        
        // Admin credentials
        const adminUsername = "madusanka";
        const adminPassword = "madu@2027";
        
        // User tracking variables
        let isAdmin = false;
        
        // Initialize page
        document.addEventListener('DOMContentLoaded', function() {
            // Check if admin was previously logged in
            const adminStatus = localStorage.getItem('dilaAdmin');
            if (adminStatus === 'true') {
                isAdmin = true;
                adminPanel.classList.add('open');
            }
            
            // Track page visit
            trackPageVisit();
            
            // Load visitor statistics
            loadVisitorStats();
            
            // Load gallery images
            loadGalleryImages();
        });
        
        // Track page visit
        function trackPageVisit() {
            // Generate a unique ID for this visitor if doesn't exist
            if (!localStorage.getItem('dilaVisitorId')) {
                const visitorId = 'visitor_' + Math.random().toString(36).substr(2, 9);
                localStorage.setItem('dilaVisitorId', visitorId);
            }
            
            const visitorId = localStorage.getItem('dilaVisitorId');
            const visitRef = database.ref('visits/' + visitorId);
            
            // Update visit count and last visit time
            visitRef.transaction(function(currentData) {
                if (currentData === null) {
                    return {
                        count: 1,
                        firstVisit: new Date().toISOString(),
                        lastVisit: new Date().toISOString()
                    };
                } else {
                    return {
                        count: (currentData.count || 0) + 1,
                        firstVisit: currentData.firstVisit || new Date().toISOString(),
                        lastVisit: new Date().toISOString()
                    };
                }
            });
            
            // Update total visits counter
            const totalVisitsRef = database.ref('stats/totalVisits');
            totalVisitsRef.transaction(function(currentCount) {
                return (currentCount || 0) + 1;
            });
        }
        
        // Load visitor statistics
        function loadVisitorStats() {
            // Listen for changes to total visits
            database.ref('stats/totalVisits').on('value', (snapshot) => {
                const count = snapshot.val() || 0;
                totalVisits.textContent = count.toLocaleString();
            });
            
            // Count current visitors
            database.ref('visits').once('value').then((snapshot) => {
                if (snapshot.exists()) {
                    const visitors = snapshot.val();
                    const visitorCount = Object.keys(visitors).length;
                    document.getElementById('visitorCount').textContent = visitorCount.toLocaleString();
                }
            });
        }
        
        // Load gallery images from Firebase
        function loadGalleryImages() {
            database.ref('galleryImages').on('value', (snapshot) => {
                const images = snapshot.val();
                photoGallery.innerHTML = ''; // Clear existing images
                
                if (images) {
                    Object.values(images).forEach(image => {
                        const galleryItem = document.createElement('div');
                        galleryItem.className = 'gallery-item';
                        galleryItem.innerHTML = `
                            <img src="${image.url}" alt="${image.alt}">
                            <div class="gallery-item-overlay">
                                <i class="fas fa-search-plus fa-3x"></i>
                            </div>
                        `;
                        photoGallery.appendChild(galleryItem);
                    });
                } else {
                    // Add default image if no images in database
                    const defaultImage = document.createElement('div');
                    defaultImage.className = 'gallery-item';
                    defaultImage.innerHTML = `
                        <img src="https://files.catbox.moe/4nqksl.jpg" alt="DILA Photography">
                        <div class="gallery-item-overlay">
                            <i class="fas fa-search-plus fa-3x"></i>
                        </div>
                    `;
                    photoGallery.appendChild(defaultImage);
                }
                
                // If admin, also load the image list for management
                if (isAdmin) {
                    loadImageList();
                }
            });
        }
        
        // Load image list for admin management
        function loadImageList() {
            database.ref('galleryImages').once('value').then((snapshot) => {
                const images = snapshot.val();
                imageList.innerHTML = '<h3>Manage Images</h3>';
                
                if (images) {
                    Object.entries(images).forEach(([key, image]) => {
                        const imageItem = document.createElement('div');
                        imageItem.className = 'image-item';
                        imageItem.innerHTML = `
                            <img src="${image.url}" alt="Thumbnail" class="image-thumb">
                            <div class="image-details">
                                <p>${image.alt}</p>
                                <small>${image.url}</small>
                            </div>
                            <div class="image-actions">
                                <button class="action-btn edit" data-key="${key}">Edit</button>
                                <button class="action-btn delete" data-key="${key}">Delete</button>
                            </div>
                        `;
                        imageList.appendChild(imageItem);
                    });
                    
                    // Add event listeners to edit and delete buttons
                    document.querySelectorAll('.action-btn.edit').forEach(btn => {
                        btn.addEventListener('click', (e) => {
                            const key = e.target.getAttribute('data-key');
                            editImage(key);
                        });
                    });
                    
                    document.querySelectorAll('.action-btn.delete').forEach(btn => {
                        btn.addEventListener('click', (e) => {
                            const key = e.target.getAttribute('data-key');
                            deleteImage(key);
                        });
                    });
                } else {
                    imageList.innerHTML += '<p>No images found. Add some images to the gallery.</p>';
                }
            });
        }
        
        // Edit image function
        function editImage(key) {
            database.ref('galleryImages/' + key).once('value').then((snapshot) => {
                const image = snapshot.val();
                if (image) {
                    adminImageUrl.value = image.url;
                    adminImageAlt.value = image.alt;
                    
                    // Change add button to update button
                    adminAddImageBtn.textContent = 'Update Image';
                    adminAddImageBtn.setAttribute('data-key', key);
                    
                    // Remove any existing update listener
                    adminAddImageBtn.replaceWith(adminAddImageBtn.cloneNode(true));
                    const newAddBtn = document.getElementById('adminAddImageBtn');
                    newAddBtn.addEventListener('click', updateImageHandler);
                    
                    // Show preview
                    imagePreview.src = image.url;
                    imagePreview.style.display = 'block';
                }
            });
        }
        
        // Update image handler
        function updateImageHandler() {
            const key = this.getAttribute('data-key');
            const url = adminImageUrl.value.trim();
            const alt = adminImageAlt.value.trim();
            
            if (url && alt) {
                database.ref('galleryImages/' + key).update({
                    url: url,
                    alt: alt
                }).then(() => {
                    alert('Image updated successfully!');
                    resetAdminForm();
                }).catch((error) => {
                    alert('Error updating image: ' + error.message);
                });
            } else {
                alert('Please provide both image URL and description');
            }
        }
        
        // Delete image function
        function deleteImage(key) {
            if (confirm('Are you sure you want to delete this image?')) {
                database.ref('galleryImages/' + key).remove()
                .then(() => {
                    alert('Image deleted successfully!');
                    loadImageList();
                })
                .catch((error) => {
                    alert('Error deleting image: ' + error.message);
                });
            }
        }
        
        // Reset admin form
        function resetAdminForm() {
            adminImageUrl.value = '';
            adminImageAlt.value = '';
            adminAddImageBtn.textContent = 'Add Image';
            adminAddImageBtn.removeAttribute('data-key');
            imagePreview.style.display = 'none';
            
            // Remove update listener and re-add add listener
            adminAddImageBtn.replaceWith(adminAddImageBtn.cloneNode(true));
            const newAddBtn = document.getElementById('adminAddImageBtn');
            newAddBtn.addEventListener('click', addImageHandler);
            
            // Reload the image list
            loadImageList();
        }
        
        // Add image handler
        function addImageHandler() {
            const url = adminImageUrl.value.trim();
            const alt = adminImageAlt.value.trim();
            
            if (url && alt) {
                // Save to Firebase
                const newImageRef = database.ref('galleryImages').push();
                newImageRef.set({
                    url: url,
                    alt: alt
                }).then(() => {
                    alert('Image added successfully!');
                    resetAdminForm();
                }).catch((error) => {
                    alert('Error adding image: ' + error.message);
                });
            } else {
                alert('Please provide both image URL and description');
            }
        }
        
        // Event Listeners for admin functions
        adminLoginBtn.addEventListener('click', () => {
            loginModal.style.display = 'flex';
        });
        
        closeModal.addEventListener('click', () => {
            loginModal.style.display = 'none';
            loginMessage.textContent = '';
        });
        
        closeAdminPanel.addEventListener('click', () => {
            adminPanel.classList.remove('open');
        });
        
        // Login with username/password
        loginSubmit.addEventListener('click', () => {
            const username = document.getElementById('adminUsername').value;
            const password = document.getElementById('adminPassword').value;
            
            if (username === adminUsername && password === adminPassword) {
                isAdmin = true;
                localStorage.setItem('dilaAdmin', 'true');
                adminPanel.classList.add('open');
                loginModal.style.display = 'none';
                loadImageList();
                alert('Admin login successful!');
            } else {
                loginMessage.textContent = 'Invalid username or password';
            }
        });
        
        // Image URL preview
        adminImageUrl.addEventListener('blur', () => {
            const url = adminImageUrl.value.trim();
            if (url) {
                imagePreview.src = url;
                imagePreview.style.display = 'block';
            } else {
                imagePreview.style.display = 'none';
            }
        });
        
        // Add image button event listener
        adminAddImageBtn.addEventListener('click', addImageHandler);
        
        // Close modals if clicked outside
        window.addEventListener('click', (event) => {
            if (event.target === loginModal) {
                loginModal.style.display = 'none';
            }
        });
    
