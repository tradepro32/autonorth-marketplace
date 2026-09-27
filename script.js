const cars = [
    {
        id: 1,
        make: "Toyota",
        model: "Camry SE",
        year: 2023,
        price: 27500,
        mileage: 28400,
        transmission: "Automatic",
        fuel: "Gasoline",
        location: "USA",
        city: "Texas",
        image: "https://upload.wikimedia.org/wikipedia/commons/9/90/CamryAXVA70V089FR23.jpg",
        color: "White",
        drivetrain: "Front-Wheel Drive",
        description: "Well-maintained Toyota Camry SE with excellent fuel economy and a comfortable interior."
    },
    {
        id: 2,
        make: "BMW",
        model: "330i",
        year: 2022,
        price: 34900,
        mileage: 31200,
        transmission: "Automatic",
        fuel: "Gasoline",
        location: "Canada",
        city: "Ontario",
        image: "https://upload.wikimedia.org/wikipedia/commons/f/fa/BMW_330i_%28G20%29_Washington_DC_Metro_Area%2C_USA_%282%29.jpg",
        color: "Black",
        drivetrain: "Rear-Wheel Drive",
        description: "Sporty BMW 330i with premium interior, smooth performance and modern technology."
    },
    {
        id: 3,
        make: "Tesla",
        model: "Model 3",
        year: 2024,
        price: 38500,
        mileage: 12800,
        transmission: "Automatic",
        fuel: "Electric",
        location: "USA",
        city: "California",
        image: "https://upload.wikimedia.org/wikipedia/commons/5/5f/2024_Tesla_Model_3.jpg",
        color: "Red",
        drivetrain: "All-Wheel Drive",
        description: "Low-mileage Tesla Model 3 with electric performance, modern technology and a clean interior."
    },
    {
        id: 4,
        make: "Honda",
        model: "CR-V EX",
        year: 2023,
        price: 31900,
        mileage: 22100,
        transmission: "Automatic",
        fuel: "Gasoline",
        location: "USA",
        city: "Florida",
        image: "https://upload.wikimedia.org/wikipedia/commons/8/8c/2023_Honda_CR-V_front_end.jpg",
        color: "Silver",
        drivetrain: "All-Wheel Drive",
        description: "Practical Honda CR-V EX with spacious seating, modern safety features and excellent everyday versatility."
    },
    {
        id: 5,
        make: "Ford",
        model: "F-150 XLT",
        year: 2022,
        price: 41900,
        mileage: 36700,
        transmission: "Automatic",
        fuel: "Gasoline",
        location: "USA",
        city: "Texas",
        image: "https://upload.wikimedia.org/wikipedia/commons/7/70/2022_Ford_F-150_XLT_Sonoma_2026.jpg",
        color: "Black",
        drivetrain: "Four-Wheel Drive",
        description: "Capable Ford F-150 XLT pickup with strong towing ability, comfortable cabin and modern features."
    },
    {
        id: 6,
        make: "Mercedes-Benz",
        model: "C300",
        year: 2023,
        price: 46900,
        mileage: 18500,
        transmission: "Automatic",
        fuel: "Gasoline",
        location: "Canada",
        city: "British Columbia",
        image: "https://upload.wikimedia.org/wikipedia/commons/e/e1/23_Mercedes-Benz_C300_4Matic.jpg",
        color: "Silver",
        drivetrain: "Rear-Wheel Drive",
        description: "Elegant Mercedes-Benz C300 with refined styling, premium comfort and advanced technology."
    }
];

function displayCars(list = cars) {
    const grid = document.querySelector(".car-grid");
    if (!grid) return;

    if (!list.length) {
        grid.innerHTML = "<p>No cars found.</p>";
        return;
    }

    grid.innerHTML = list.map(car => {
        const badge = car.plan === "Premium" ? "PREMIUM LISTING" : car.plan === "Featured" ? "FEATURED LISTING" : (car.mileage <= 15000 ? "LOW MILEAGE" : car.price >= 45000 ? "PREMIUM" : "EXCELLENT CONDITION");
        return `
        <article class="car-card" data-car-id="${car.id}" style="cursor:pointer;">
            <div class="car-image">
                <img src="${car.image}" alt="${car.year} ${car.make} ${car.model}" loading="lazy">
                <div class="car-card-badge">${badge}</div>
            </div>
            <div class="car-info">
                <p class="car-year">${car.year}</p>
                <h3>${car.make} ${car.model}</h3>
                <p class="car-details">${car.mileage.toLocaleString()} miles • ${car.transmission} • ${car.fuel}</p>
                <div class="car-bottom">
                    <strong>${car.price.toLocaleString()}</strong>
                    <span>${car.city}, ${car.location}</span>
                </div>
                <div style="display:flex;gap:8px;margin-top:10px;">
                    <button type="button" class="view-details-btn" data-car-id="${car.id}" style="flex:1;">View Details</button>
                    <button type="button" class="save-car-btn" data-car-id="${car.id}" aria-label="Save car" style="width:48px;border:1px solid #e5e7eb;border-radius:8px;background:white;font-size:22px;cursor:pointer;">♡</button>
                </div>
            </div>
        </article>
    `;
    }).join("");
}

function searchCars() {
    const make = document.getElementById("make")?.value || "";
    const model = (document.getElementById("model")?.value || "").toLowerCase().trim();
    const price = document.getElementById("price")?.value || "";
    const location = document.getElementById("location")?.value || "";

    displayCars(cars.filter(car =>
        (!make || car.make === make) &&
        (!model || car.model.toLowerCase().includes(model)) &&
        (!price || car.price <= Number(price)) &&
        (!location ||
            (location === "United States" && car.location === "USA") ||
            (location === "Canada" && car.location === "Canada"))
    ));
}

function openCarDetails(id) {
    const car = cars.find(item => item.id === Number(id));
    if (!car) return;

    const overlay = document.createElement("div");
    overlay.id = "vehicle-details-overlay";
    overlay.className = "vehicle-details-overlay";

    overlay.innerHTML = `
        <div class="vehicle-details-modal">
            <button type="button" id="closeVehicleDetails" class="vehicle-details-close">×</button>

            <img src="${car.image}" alt="${car.make} ${car.model}" class="vehicle-details-image">

            <div class="vehicle-details-content">
                <p class="vehicle-details-year">${car.year}</p>
                <div class="vehicle-details-title-row">
                    <div>
                        <h2>${car.make} ${car.model}</h2>
                        <p class="vehicle-details-location">${car.city}, ${car.location}</p>
                    </div>
                    <strong class="vehicle-details-price">$ ${car.price.toLocaleString()}</strong>
                </div>

                <div class="vehicle-spec-grid">
                    <div><span>Mileage</span><strong>${car.mileage.toLocaleString()} mi</strong></div>
                    <div><span>Transmission</span><strong>${car.transmission}</strong></div>
                    <div><span>Fuel Type</span><strong>${car.fuel}</strong></div>
                    <div><span>Color</span><strong>${car.color}</strong></div>
                    <div><span>Drivetrain</span><strong>${car.drivetrain}</strong></div>
                    <div><span>Condition</span><strong>Excellent</strong></div>
                </div>

                <h3 class="vehicle-description-title">About this vehicle</h3>
                <p class="vehicle-details-description">${car.description}</p>

                <button type="button" id="contactSellerButton" class="vehicle-contact-button">Contact Seller</button>
            </div>
        </div>
    `;

    document.body.appendChild(overlay);

    document.getElementById("closeVehicleDetails").onclick = () => overlay.remove();
    overlay.onclick = event => {
        if (event.target === overlay) overlay.remove();
    };
    document.getElementById("contactSellerButton").onclick = () => {
        showContactSellerForm(car);
    };
}

document.addEventListener("click", event => {
    const button = event.target.closest(".view-details-btn");
    if (button) {
        event.preventDefault();
        event.stopPropagation();
        openCarDetails(button.dataset.carId);
        return;
    }

    const card = event.target.closest(".car-card");
    if (card) {
        openCarDetails(card.dataset.carId);
    }
});

document.addEventListener("DOMContentLoaded", () => {
    loadUserListings();
    displayCars();
    const saved = JSON.parse(localStorage.getItem("autonorth_saved_cars") || "[]");
    document.querySelectorAll(".save-car-btn").forEach(button => {
        if (saved.includes(Number(button.dataset.carId))) {
            button.textContent = "♥";
            button.style.color = "#e63946";
        }
    });
});


function showSavedCars() {
    const savedIds = JSON.parse(localStorage.getItem("autonorth_saved_cars") || "[]");
    const savedCars = cars.filter(car => savedIds.includes(car.id));
    const modal = document.createElement("div");
    modal.id = "autonorth-modal";
    modal.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,.78);z-index:999999;display:flex;align-items:center;justify-content:center;padding:20px;overflow:auto;";
    modal.innerHTML = `
        <div style="background:#fff;color:#111827;width:100%;max-width:900px;max-height:92vh;overflow:auto;border-radius:18px;padding:30px;position:relative;">
            <button type="button" id="closeSavedCars" style="position:absolute;right:16px;top:16px;width:42px;height:42px;border:0;border-radius:50%;background:#f3f4f6;font-size:26px;cursor:pointer;">×</button>
            <p style="color:#e63946;font-size:12px;font-weight:800;letter-spacing:2px;">YOUR GARAGE</p>
            <h2 style="font-size:32px;margin:6px 0 20px;">Saved Cars</h2>
            ${savedCars.length ? `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:18px;">${savedCars.map(car => `
                <div style="border:1px solid #e5e7eb;border-radius:14px;overflow:hidden;">
                    <img src="${car.image}" alt="${car.make} ${car.model}" style="width:100%;height:150px;object-fit:cover;">
                    <div style="padding:16px;">
                        <h3>${car.year} ${car.make} ${car.model}</h3>
                        <p style="color:#e63946;font-weight:800;">${car.price.toLocaleString()}</p>
                        <button type="button" class="saved-view-btn" data-car-id="${car.id}" style="width:100%;padding:10px;border:0;border-radius:8px;background:#111827;color:white;cursor:pointer;">View Details</button>
                    </div>
                </div>`).join("")}</div>` : `<div style="text-align:center;padding:40px 10px;color:#6b7280;"><div style="font-size:48px;">♡</div><h3>No saved cars yet</h3><p>Click the heart on a car to save it here.</p></div>`}
        </div>`;
    document.body.appendChild(modal);
    document.getElementById("closeSavedCars").onclick = () => modal.remove();
    modal.onclick = event => {
        if (event.target === modal) modal.remove();
        const view = event.target.closest(".saved-view-btn");
        if (view) { modal.remove(); openCarDetails(view.dataset.carId); }
    };
}

function closeAutoNorthModal() {
    const modal = document.getElementById("autonorth-modal");
    if (modal) modal.remove();
}

function loadUserListings() {
    const savedListings = JSON.parse(localStorage.getItem("autonorth_user_listings") || "[]");
    savedListings.forEach(listing => {
        if (!cars.some(car => car.id === listing.id)) {
            cars.push(listing);
        }
    });
}

function showPricing() {
    closeAutoNorthModal();

    const modal = document.createElement("div");
    modal.id = "autonorth-modal";
    modal.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,.78);z-index:999999;display:flex;align-items:center;justify-content:center;padding:20px;overflow:auto;";

    modal.innerHTML = `
        <div class="pricing-modal">
            <button type="button" id="closePricingModal" class="pricing-close" aria-label="Close">×</button>

            <div class="pricing-header">
                <p class="pricing-eyebrow">SELL WITH AUTONORTH</p>
                <h2>Choose the right exposure for your car</h2>
                <p>Simple plans designed to help buyers discover your vehicle. Choose a plan, create your listing, and you're ready for the next step.</p>
            </div>

            <div class="pricing-grid">
                <div class="pricing-card">
                    <div class="pricing-card-top">
                        <span class="pricing-plan-label">STARTER</span>
                        <h3>Basic</h3>
                        <p class="pricing-price">$9.99 <span>per listing</span></p>
                        <p class="pricing-description">A simple, affordable way to put your vehicle in front of AutoNorth buyers.</p>
                    </div>
                    <ul class="pricing-features">
                        <li>✓ 1 vehicle listing</li>
                        <li>✓ Standard search visibility</li>
                        <li>✓ Vehicle photos & full details</li>
                        <li>✓ Buyer inquiries</li>
                        <li>✓ 30-day listing period</li>
                    </ul>
                    <button type="button" class="choose-plan pricing-button pricing-button-dark" data-plan="Basic" data-price="9.99">Choose Basic</button>
                </div>

                <div class="pricing-card pricing-card-popular">
                    <span class="pricing-popular-badge">MOST POPULAR</span>
                    <div class="pricing-card-top">
                        <span class="pricing-plan-label">MORE VISIBILITY</span>
                        <h3>Featured</h3>
                        <p class="pricing-price">$19.99 <span>per listing</span></p>
                        <p class="pricing-description">Give your vehicle extra visibility and make it easier for buyers to notice.</p>
                    </div>
                    <ul class="pricing-features">
                        <li>✓ Everything in Basic</li>
                        <li>✓ Featured badge on your listing</li>
                        <li>✓ Priority placement in listings</li>
                        <li>✓ Extra visibility for your vehicle</li>
                        <li>✓ 30-day listing period</li>
                    </ul>
                    <button type="button" class="choose-plan pricing-button pricing-button-red" data-plan="Featured" data-price="19.99">Choose Featured</button>
                </div>

                <div class="pricing-card pricing-card-premium">
                    <div class="pricing-card-top">
                        <span class="pricing-plan-label">MAXIMUM EXPOSURE</span>
                        <h3>Premium</h3>
                        <p class="pricing-price">$29.99 <span>per listing</span></p>
                        <p class="pricing-description">For sellers who want their vehicle to stand out with the highest available placement.</p>
                    </div>
                    <ul class="pricing-features">
                        <li>✓ Everything in Featured</li>
                        <li>✓ Premium badge & highlighted listing</li>
                        <li>✓ Top placement for stronger visibility</li>
                        <li>✓ Maximum marketplace exposure</li>
                        <li>✓ 60-day listing period</li>
                    </ul>
                    <button type="button" class="choose-plan pricing-button pricing-button-dark" data-plan="Premium" data-price="29.99">Choose Premium</button>
                </div>
            </div>

            <p class="pricing-note">Payment processing will be connected before launch. This current version is a working demo and does not charge you.</p>
        </div>
    `;

    document.body.appendChild(modal);

    document.getElementById("closePricingModal").onclick = closeAutoNorthModal;
    modal.onclick = event => {
        if (event.target === modal) closeAutoNorthModal();
    };
}
function showListingForm(plan = "Basic", planPrice = "9.99") {
    closeAutoNorthModal();

    const modal = document.createElement("div");
    modal.id = "autonorth-modal";
    modal.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,.78);z-index:999999;display:flex;align-items:center;justify-content:center;padding:20px;overflow:auto;";

    modal.innerHTML = `
        <div style="background:#fff;color:#111827;width:100%;max-width:760px;max-height:92vh;overflow:auto;border-radius:18px;padding:30px;position:relative;">
            <button type="button" id="closeListingModal" aria-label="Close" style="position:absolute;right:16px;top:16px;width:42px;height:42px;border:0;border-radius:50%;background:#f3f4f6;font-size:26px;cursor:pointer;">×</button>

            <p style="color:#e63946;font-size:12px;font-weight:800;letter-spacing:2px;margin-bottom:8px;">CREATE YOUR LISTING</p>
            <h2 style="font-size:32px;margin-bottom:5px;">List your car</h2>
            <div class="selected-plan-summary">
                <div>
                    <span>SELECTED PLAN</span>
                    <strong>${plan}</strong>
                </div>
                <strong class="selected-plan-price">${Number(planPrice).toFixed(2)}</strong>
            </div>
            <p class="listing-form-note">Complete your vehicle details below. Your listing will be prepared with the selected visibility plan.</p>

            <form id="vehicleListingForm">
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;">
                    <label>Make<input required name="make" placeholder="e.g. Toyota" style="width:100%;padding:12px;margin-top:6px;border:1px solid #d1d5db;border-radius:7px;"></label>
                    <label>Model<input required name="model" placeholder="e.g. Camry SE" style="width:100%;padding:12px;margin-top:6px;border:1px solid #d1d5db;border-radius:7px;"></label>
                    <label>Year<input required type="number" min="1980" max="2027" name="year" placeholder="2023" style="width:100%;padding:12px;margin-top:6px;border:1px solid #d1d5db;border-radius:7px;"></label>
                    <label>Price (USD)<input required type="number" min="1" name="price" placeholder="27500" style="width:100%;padding:12px;margin-top:6px;border:1px solid #d1d5db;border-radius:7px;"></label>
                    <label>Mileage<input required type="number" min="0" name="mileage" placeholder="28400" style="width:100%;padding:12px;margin-top:6px;border:1px solid #d1d5db;border-radius:7px;"></label>
                    <label>Location<select required name="location" style="width:100%;padding:12px;margin-top:6px;border:1px solid #d1d5db;border-radius:7px;"><option value="">Select</option><option>United States</option><option>Canada</option></select></label>
                    <label>City / State / Province<input required name="city" placeholder="e.g. Texas" style="width:100%;padding:12px;margin-top:6px;border:1px solid #d1d5db;border-radius:7px;"></label>
                    <label>Fuel<select required name="fuel" style="width:100%;padding:12px;margin-top:6px;border:1px solid #d1d5db;border-radius:7px;"><option value="">Select</option><option>Gasoline</option><option>Diesel</option><option>Hybrid</option><option>Electric</option></select></label>
                    <label>Transmission<select required name="transmission" style="width:100%;padding:12px;margin-top:6px;border:1px solid #d1d5db;border-radius:7px;"><option value="">Select</option><option>Automatic</option><option>Manual</option></select></label>
                    <label style="grid-column:1/-1;">Photo URL<input name="image" placeholder="https://..." style="width:100%;padding:12px;margin-top:6px;border:1px solid #d1d5db;border-radius:7px;"></label>
                    <label style="grid-column:1/-1;">Description<textarea name="description" rows="4" placeholder="Tell buyers about the vehicle..." style="width:100%;padding:12px;margin-top:6px;border:1px solid #d1d5db;border-radius:7px;resize:vertical;"></textarea></label>
                </div>
                <button type="submit" style="width:100%;margin-top:20px;padding:15px;border:0;border-radius:8px;background:#e63946;color:white;font-weight:800;font-size:16px;cursor:pointer;">Continue with ${plan} — ${planPrice}</button>
                <p style="font-size:12px;color:#6b7280;margin-top:10px;text-align:center;">Demo listing flow: no payment is charged yet.</p>
            </form>
        </div>
    `;

    document.body.appendChild(modal);

    document.getElementById("closeListingModal").onclick = closeAutoNorthModal;
    modal.onclick = event => {
        if (event.target === modal) closeAutoNorthModal();
    };

    document.getElementById("vehicleListingForm").onsubmit = event => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const vehicle = Object.fromEntries(formData.entries());

        const newListing = {
            id: Date.now(),
            make: vehicle.make,
            model: vehicle.model,
            year: Number(vehicle.year),
            price: Number(vehicle.price),
            mileage: Number(vehicle.mileage),
            transmission: vehicle.transmission,
            fuel: vehicle.fuel,
            location: vehicle.location,
            city: vehicle.city,
            image: vehicle.image || "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80",
            color: "Not specified",
            drivetrain: "Not specified",
            description: vehicle.description || "Vehicle listed by an AutoNorth seller.",
            plan: plan,
            planPrice: Number(planPrice)
        };

        closeAutoNorthModal();

        const paymentModal = document.createElement("div");
        paymentModal.id = "autonorth-modal";
        paymentModal.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,.78);z-index:999999;display:flex;align-items:center;justify-content:center;padding:20px;overflow:auto;";
        paymentModal.innerHTML = `
            <div style="background:white;color:#111827;max-width:620px;width:100%;border-radius:18px;padding:30px;position:relative;">
                <button type="button" id="closePaymentModal" aria-label="Close" style="position:absolute;right:16px;top:16px;width:42px;height:42px;border:0;border-radius:50%;background:#f3f4f6;font-size:26px;cursor:pointer;">×</button>
                <p style="color:#e63946;font-size:12px;font-weight:800;letter-spacing:2px;margin-bottom:8px;">SECURE CHECKOUT</p>
                <h2 style="font-size:30px;margin-bottom:6px;">Choose your payment method</h2>
                <p style="color:#6b7280;line-height:1.5;margin-bottom:22px;">For sellers in the United States and Canada.</p>

                <div style="border:1px solid #e5e7eb;border-radius:12px;padding:16px;margin-bottom:18px;background:#f8fafc;">
                    <strong>${plan} listing</strong>
                    <span style="float:right;font-weight:800;color:#e63946;">$${Number(planPrice).toFixed(2)} USD</span>
                </div>

                <button type="button" class="payment-option" data-method="Card" style="width:100%;padding:17px;margin-bottom:10px;border:1px solid #d1d5db;border-radius:10px;background:white;text-align:left;cursor:pointer;font-weight:800;">💳 Credit / Debit Card <span style="float:right;color:#6b7280;">Visa • Mastercard • Amex</span></button>
                <button type="button" class="payment-option" data-method="PayPal" style="width:100%;padding:17px;margin-bottom:10px;border:1px solid #d1d5db;border-radius:10px;background:white;text-align:left;cursor:pointer;font-weight:800;">🅿️ PayPal <span style="float:right;color:#6b7280;">US & Canada</span></button>
                <button type="button" class="payment-option" data-method="Apple Pay / Google Pay" style="width:100%;padding:17px;border:1px solid #d1d5db;border-radius:10px;background:white;text-align:left;cursor:pointer;font-weight:800;">📱 Apple Pay / Google Pay <span style="float:right;color:#6b7280;">Where supported</span></button>

                <p style="font-size:12px;color:#6b7280;text-align:center;margin-top:18px;">Demo checkout — no payment is processed yet. Stripe/PayPal will be connected before launch.</p>
            </div>
        `;
        document.body.appendChild(paymentModal);

        document.getElementById("closePaymentModal").onclick = closeAutoNorthModal;
        paymentModal.onclick = event => {
            if (event.target === paymentModal) closeAutoNorthModal();
        };

        paymentModal.querySelectorAll(".payment-option").forEach(button => {
            button.onclick = () => {
                const checkout = document.createElement("div");
                checkout.id = "autonorth-modal";
                checkout.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,.78);z-index:999999;display:flex;align-items:center;justify-content:center;padding:20px;";
                checkout.innerHTML = `
                    <div style="background:white;color:#111827;max-width:520px;width:100%;border-radius:18px;padding:30px;text-align:center;">
                        <div style="font-size:44px;margin-bottom:8px;">🔒</div>
                        <p style="color:#e63946;font-size:12px;font-weight:800;letter-spacing:2px;">${button.dataset.method.toUpperCase()}</p>
                        <h2>Secure checkout</h2>
                        <p style="color:#6b7280;line-height:1.6;">You selected <strong>${plan}</strong> for <strong>${Number(planPrice).toFixed(2)} USD</strong>.</p>
                        <div style="padding:14px;background:#f8fafc;border-radius:10px;margin:18px 0;color:#6b7280;font-size:13px;">Payment processing is not connected in this demo. No payment will be taken.</div>
                        <button type="button" id="backToPayment" style="padding:13px 22px;border:0;border-radius:8px;background:#111827;color:white;font-weight:800;cursor:pointer;">Back to payment methods</button>
                    </div>
                `;
                document.body.appendChild(checkout);
                document.getElementById("backToPayment").onclick = () => {
                    checkout.remove();
                };
            };
        });
    };
}

function showContactSellerForm(car) {
    const existing = document.getElementById("seller-contact-overlay");
    if (existing) existing.remove();

    const overlay = document.createElement("div");
    overlay.id = "seller-contact-overlay";
    overlay.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,.78);z-index:1000000;display:flex;align-items:center;justify-content:center;padding:20px;";

    overlay.innerHTML = `
        <div style="background:#fff;color:#111827;max-width:560px;width:100%;border-radius:18px;padding:30px;position:relative;">
            <button type="button" id="closeSellerContact" aria-label="Close" style="position:absolute;right:15px;top:15px;width:40px;height:40px;border:0;border-radius:50%;background:#f3f4f6;font-size:24px;cursor:pointer;">×</button>
            <p style="color:#e63946;font-size:12px;font-weight:800;letter-spacing:2px;margin-bottom:8px;">CONTACT SELLER</p>
            <h2 style="margin-bottom:6px;">Ask about the ${car.year} ${car.make} ${car.model}</h2>
            <p style="color:#6b7280;margin-bottom:20px;">Send an inquiry about this vehicle.</p>
            <form id="sellerContactForm">
                <label style="display:block;margin-bottom:14px;">Your Name
                    <input required name="name" placeholder="Your name" style="width:100%;padding:12px;margin-top:6px;border:1px solid #d1d5db;border-radius:7px;">
                </label>
                <label style="display:block;margin-bottom:14px;">Email
                    <input required type="email" name="email" placeholder="you@example.com" style="width:100%;padding:12px;margin-top:6px;border:1px solid #d1d5db;border-radius:7px;">
                </label>
                <label style="display:block;margin-bottom:14px;">Message
                    <textarea required name="message" rows="4" placeholder="I'm interested in this vehicle..." style="width:100%;padding:12px;margin-top:6px;border:1px solid #d1d5db;border-radius:7px;resize:vertical;"></textarea>
                </label>
                <button type="submit" style="width:100%;padding:14px;border:0;border-radius:8px;background:#e63946;color:white;font-weight:800;cursor:pointer;">Send Inquiry</button>
            </form>
        </div>
    `;

    document.body.appendChild(overlay);

    document.getElementById("closeSellerContact").onclick = () => overlay.remove();
    overlay.onclick = event => {
        if (event.target === overlay) overlay.remove();
    };

    document.getElementById("sellerContactForm").onsubmit = event => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const name = form.get("name");
        overlay.querySelector("div").innerHTML = `
            <div style="text-align:center;padding:15px;">
                <div style="font-size:48px;margin-bottom:10px;">✓</div>
                <h2>Inquiry sent</h2>
                <p style="color:#6b7280;line-height:1.6;">Thanks, ${name}. Your inquiry for the ${car.year} ${car.make} ${car.model} has been prepared. Seller messaging can be connected to the backend next.</p>
                <button type="button" id="finishSellerContact" style="padding:13px 24px;border:0;border-radius:8px;background:#e63946;color:white;font-weight:800;cursor:pointer;">Done</button>
            </div>
        `;
        document.getElementById("finishSellerContact").onclick = () => overlay.remove();
    };
}


document.addEventListener("click", event => {
    const saveButton = event.target.closest(".save-car-btn");
    if (saveButton) {
        event.preventDefault();
        event.stopPropagation();
        const carId = Number(saveButton.dataset.carId);
        const saved = JSON.parse(localStorage.getItem("autonorth_saved_cars") || "[]");
        const index = saved.indexOf(carId);
        if (index === -1) {
            saved.push(carId);
            saveButton.textContent = "♥";
            saveButton.style.color = "#e63946";
        } else {
            saved.splice(index, 1);
            saveButton.textContent = "♡";
            saveButton.style.color = "";
        }
        localStorage.setItem("autonorth_saved_cars", JSON.stringify(saved));
        return;
    }

    const planButton = event.target.closest(".choose-plan");
    if (planButton) {
        showListingForm(planButton.dataset.plan, planButton.dataset.price);
        return;
    }

    if (event.target.closest(".sell-btn") || event.target.closest(".sell-main-btn")) {
        showPricing();
        return;
    }

    const pricingButton = event.target.closest('[onclick="showPricing()"]');
    if (pricingButton) {
        event.preventDefault();
        showPricing();
    }
});


// AutoNorth global button handlers
window.showPricing = showPricing;
window.showListingForm = showListingForm;
window.searchCars = searchCars;
window.openCarDetails = openCarDetails;
window.showContactSellerForm = showContactSellerForm;
window.showSavedCars = showSavedCars;
console.log("AutoNorth script v11 loaded");
