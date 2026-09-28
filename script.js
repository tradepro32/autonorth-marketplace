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

function formatUSD(value) { return "$" + Number(value || 0).toLocaleString("en-US"); }

function normalizeLocation(value) {
    const v = String(value || "").trim().toLowerCase();
    if (v === "united states" || v === "usa" || v === "us" || v === "u.s.a.") return "USA";
    if (v === "canada" || v === "ca") return "Canada";
    return String(value || "").trim();
}


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
                ${car.plan ? `<div class="car-plan-label">${car.plan} seller plan • ${formatUSD(car.planPrice)}</div>` : ""}
                <div class="car-bottom">
                    <strong>${formatUSD(car.price)}</strong>
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

function showAllCars() {
    const make = document.getElementById("make");
    const model = document.getElementById("model");
    const price = document.getElementById("price");
    const location = document.getElementById("location");

    if (make) make.value = "";
    if (model) model.value = "";
    if (price) price.value = "";
    if (location) location.value = "";
    const fuel = document.getElementById("fuelFilter");
    const transmission = document.getElementById("transmissionFilter");
    const sort = document.getElementById("sortCars");
    if (fuel) fuel.value = "";
    if (transmission) transmission.value = "";
    if (sort) sort.value = "featured";

    displayCars(cars);
    document.getElementById("cars")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function searchCars() { applyMarketplaceControls(); }

function applyMarketplaceControls() {
    const make = document.getElementById("make")?.value || "";
    const model = (document.getElementById("model")?.value || "").toLowerCase().trim();
    const price = document.getElementById("price")?.value || "";
    const location = document.getElementById("location")?.value || "";
    const fuel = document.getElementById("fuelFilter")?.value || "";
    const transmission = document.getElementById("transmissionFilter")?.value || "";
    const sort = document.getElementById("sortCars")?.value || "featured";
    let results = cars.filter(car => (!make || car.make === make) && (!model || car.model.toLowerCase().includes(model)) && (!price || car.price <= Number(price)) && (!location || normalizeLocation(car.location) === normalizeLocation(location)) && (!fuel || car.fuel === fuel) && (!transmission || car.transmission === transmission));
    if (sort === "price-low") results.sort((a,b) => a.price-b.price);
    if (sort === "price-high") results.sort((a,b) => b.price-a.price);
    if (sort === "mileage") results.sort((a,b) => a.mileage-b.mileage);
    if (sort === "year") results.sort((a,b) => b.year-a.year);
    if (sort === "featured") results.sort((a,b) => (b.plan === "Premium")-(a.plan === "Premium") || (b.plan === "Featured")-(a.plan === "Featured"));
    displayCars(results);
    document.getElementById("cars")?.scrollIntoView({behavior:"smooth",block:"start"});
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
                    <strong class="vehicle-details-price">${formatUSD(car.price)}</strong>
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
    // Save buttons have their own delegated handler below; never open the car details modal for them.
    if (event.target.closest(".save-car-btn")) return;

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
    const listings = JSON.parse(localStorage.getItem("autonorth_user_listings") || "[]");

    const modal = document.createElement("div");
    modal.id = "autonorth-modal";
    modal.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,.78);z-index:999999;display:flex;align-items:center;justify-content:center;padding:20px;overflow:auto;";
    modal.innerHTML = `
        <div style="background:#fff;color:#111827;width:100%;max-width:1050px;max-height:92vh;overflow:auto;border-radius:20px;padding:32px;position:relative;">
            <button type="button" id="closeSavedCars" style="position:absolute;right:18px;top:18px;width:42px;height:42px;border:0;border-radius:50%;background:#f3f4f6;font-size:26px;cursor:pointer;">×</button>

            <p style="color:#e63946;font-size:12px;font-weight:800;letter-spacing:2px;margin:0 0 6px;">YOUR GARAGE</p>
            <h2 style="font-size:32px;margin:0 0 8px;">My Garage</h2>
            <p style="color:#6b7280;margin:0 0 28px;">Manage cars you've saved and vehicles you've listed.</p>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:28px;align-items:start;">

                <section style="border:1px solid #e5e7eb;border-radius:16px;padding:22px;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;">
                        <div>
                            <p style="color:#e63946;font-size:11px;font-weight:800;letter-spacing:1.5px;margin:0 0 4px;">BUYER</p>
                            <h3 style="font-size:22px;margin:0;">Saved Cars</h3>
                        </div>
                        <span style="background:#f3f4f6;border-radius:20px;padding:6px 11px;font-size:13px;font-weight:700;">${savedCars.length}</span>
                    </div>
                    ${savedCars.length ? `<div style="display:grid;gap:14px;">${savedCars.map(car => `
                        <div style="display:flex;gap:12px;border:1px solid #e5e7eb;border-radius:12px;padding:10px;align-items:center;">
                            <img src="${car.image}" alt="${car.make} ${car.model}" style="width:100px;height:72px;object-fit:cover;border-radius:9px;">
                            <div style="flex:1;min-width:0;">
                                <strong style="display:block;">${car.year} ${car.make} ${car.model}</strong>
                                <span style="display:block;color:#e63946;font-weight:800;margin-top:4px;">${formatUSD(car.price)}</span>
                                <span style="display:block;color:#6b7280;font-size:12px;margin-top:2px;">${car.city}, ${car.location}</span>
                            </div>
                            <button type="button" class="saved-view-btn" data-car-id="${car.id}" style="padding:8px 11px;border:0;border-radius:8px;background:#111827;color:white;cursor:pointer;">View</button>
                        </div>`).join("")}</div>` : `<div style="text-align:center;padding:35px 10px;color:#6b7280;background:#f9fafb;border-radius:12px;"><div style="font-size:40px;">♡</div><strong>No saved cars yet</strong><p style="margin:6px 0 0;font-size:13px;">Save a car from the marketplace to find it here.</p></div>`}
                </section>

                <section style="border:1px solid #e5e7eb;border-radius:16px;padding:22px;">
                    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:18px;">
                        <div>
                            <p style="color:#e63946;font-size:11px;font-weight:800;letter-spacing:1.5px;margin:0 0 4px;">SELLER</p>
                            <h3 style="font-size:22px;margin:0;">My Live Listings</h3>
                        </div>
                        <span style="background:#f3f4f6;border-radius:20px;padding:6px 11px;font-size:13px;font-weight:700;">${listings.length}</span>
                    </div>
                    ${listings.length ? `<div style="display:grid;gap:14px;">${listings.map(listing => `
                        <div style="display:flex;gap:12px;border:1px solid #e5e7eb;border-radius:12px;padding:10px;align-items:center;">
                            <img src="${listing.image}" alt="${listing.make} ${listing.model}" style="width:100px;height:72px;object-fit:cover;border-radius:9px;">
                            <div style="flex:1;min-width:0;">
                                <strong style="display:block;">${listing.year} ${listing.make} ${listing.model}</strong>
                                <span style="display:block;color:#e63946;font-weight:800;margin-top:4px;">${formatUSD(listing.price)}</span>
                                <span style="display:block;color:#6b7280;font-size:12px;margin-top:2px;">${listing.plan} • ${listing.paymentStatus === "demo-completed" ? "Live" : "Pending"}</span>
                            </div>
                            <button type="button" class="my-listing-view-btn" data-car-id="${listing.id}" style="padding:8px 11px;border:0;border-radius:8px;background:#111827;color:white;cursor:pointer;">View</button>
                        </div>`).join("")}</div>` : `<div style="text-align:center;padding:35px 10px;color:#6b7280;background:#f9fafb;border-radius:12px;"><div style="font-size:40px;">🚗</div><strong>No listings yet</strong><p style="margin:6px 0 0;font-size:13px;">Choose a seller plan to publish your vehicle.</p></div>`}
                </section>
            </div>
        </div>`;
    document.body.appendChild(modal);

    document.getElementById("closeSavedCars").onclick = () => modal.remove();
    modal.onclick = event => {
        if (event.target === modal) modal.remove();
        const view = event.target.closest(".saved-view-btn,.my-listing-view-btn");
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
            cars.push({...listing, location: normalizeLocation(listing.location)});
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
    const account = getAccount();
    const token = localStorage.getItem("autonorth_token");
    if (!account || !token) {
        showAccount();
        return;
    }

    closeAutoNorthModal();

    const modal = document.createElement("div");
    modal.id = "autonorth-modal";
    modal.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,.78);z-index:999999;display:flex;align-items:center;justify-content:center;padding:20px;overflow:auto;";

    modal.innerHTML = `
        <div style="background:#fff;color:#111827;width:100%;max-width:760px;max-height:92vh;overflow:auto;border-radius:18px;padding:30px;position:relative;">
            <button type="button" id="closeListingModal" aria-label="Close" style="position:absolute;right:16px;top:16px;width:42px;height:42px;border:0;border-radius:50%;background:#f3f4f6;font-size:26px;cursor:pointer;">×</button>
            <p style="color:#e63946;font-size:12px;font-weight:800;letter-spacing:2px;margin-bottom:8px;">CREATE YOUR LISTING</p>
            <h2 style="font-size:32px;margin-bottom:5px;">List your car</h2>
            <div class="selected-plan-summary"><div><span>SELECTED PLAN</span><strong>${plan}</strong></div><strong class="selected-plan-price">${Number(planPrice).toFixed(2)}</strong></div>
            <p class="listing-form-note">Complete your vehicle details below. Your listing will be saved to your AutoNorth seller account.</p>
            <div class="listing-process-steps"><span class="active">1. Vehicle details</span><span>2. Payment</span><span>3. Listing submitted</span></div>
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
                <button type="submit" id="saveListingButton" style="width:100%;margin-top:20px;padding:15px;border:0;border-radius:8px;background:#e63946;color:white;font-weight:800;font-size:16px;cursor:pointer;">Save Listing — ${plan}</button>
                <p style="font-size:12px;color:#6b7280;margin-top:10px;text-align:center;">Payment is still demo-only. Your listing will be stored in the database as pending.</p>
            </form>
        </div>
    `;

    document.body.appendChild(modal);
    document.getElementById("closeListingModal").onclick = closeAutoNorthModal;
    modal.onclick = event => { if (event.target === modal) closeAutoNorthModal(); };

    document.getElementById("vehicleListingForm").onsubmit = async event => {
        event.preventDefault();
        const submit = document.getElementById("saveListingButton");
        const vehicle = Object.fromEntries(new FormData(event.currentTarget));
        submit.disabled = true;
        submit.textContent = "Saving to AutoNorth...";

        try {
            const result = await apiRequest("/listings", {
                method: "POST",
                body: JSON.stringify({
                    make: vehicle.make,
                    model: vehicle.model,
                    year: Number(vehicle.year),
                    price: Number(vehicle.price),
                    mileage: Number(vehicle.mileage),
                    transmission: vehicle.transmission,
                    fuel: vehicle.fuel,
                    location: normalizeLocation(vehicle.location),
                    city: vehicle.city,
                    image: vehicle.image || "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80",
                    description: vehicle.description || "Vehicle listed by an AutoNorth seller.",
                    plan,
                    planPrice: Number(planPrice)
                })
            });

            const listing = result.listing;
            const liveModal = document.createElement("div");
            liveModal.id = "autonorth-modal";
            liveModal.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,.78);z-index:999999;display:flex;align-items:center;justify-content:center;padding:20px;";
            liveModal.innerHTML = `
                <div style="background:white;color:#111827;max-width:560px;width:100%;border-radius:18px;padding:30px;text-align:center;">
                    <div style="width:70px;height:70px;border-radius:50%;background:#fff7ed;color:#ea580c;display:flex;align-items:center;justify-content:center;font-size:38px;font-weight:900;margin:0 auto 14px;">✓</div>
                    <p style="color:#ea580c;font-size:12px;font-weight:800;letter-spacing:2px;">LISTING SUBMITTED</p>
                    <h2 style="font-size:30px;margin:6px 0 10px;">Your listing is saved</h2>
                    <p style="color:#6b7280;line-height:1.6;">${listing.year} ${listing.make} ${listing.model} has been saved to your seller account.</p>
                    <div class="checkout-process-steps" style="margin:20px 0;">
                        <span class="done">✓ Vehicle details</span>
                        <span class="active">2. Payment</span>
                        <span>3. Listing live</span>
                    </div>
                    <div style="padding:16px;background:#f8fafc;border:1px solid #e5e7eb;border-radius:12px;text-align:left;margin-bottom:18px;">
                        <strong>${plan} plan</strong>
                        <span style="float:right;font-weight:800;color:#e63946;">${formatUSD(planPrice)}</span>
                        <p style="margin:8px 0 0;color:#6b7280;font-size:13px;">Status: Pending</p>
                    </div>
                    <p style="font-size:12px;color:#6b7280;line-height:1.5;">The listing is now in your database-backed Seller Dashboard. Real payment and automatic activation will be connected next.</p>
                    <button type="button" id="finishListing" style="width:100%;padding:14px;border:0;border-radius:8px;background:#111827;color:white;font-weight:800;cursor:pointer;">Open Seller Dashboard</button>
                </div>
            `;
            document.body.appendChild(liveModal);
            document.getElementById("finishListing").onclick = () => {
                liveModal.remove();
                showSellerDashboard();
            };
        } catch (err) {
            submit.disabled = false;
            submit.textContent = `Save Listing — ${plan}`;
            const error = document.createElement("div");
            error.style.cssText = "margin-top:12px;padding:12px;border-radius:8px;background:#fef2f2;color:#b91c1c;border:1px solid #fecaca;font-size:13px;";
            error.textContent = err.message || "Could not save listing.";
            submit.parentElement.appendChild(error);
        }
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
        const inquiries = JSON.parse(localStorage.getItem("autonorth_inquiries") || "[]");
        inquiries.push({id:Date.now(),carId:car.id,vehicle:car.year+" "+car.make+" "+car.model,name:String(name),email:String(form.get("email")),message:String(form.get("message")),createdAt:new Date().toISOString(),status:"New"});
        localStorage.setItem("autonorth_inquiries", JSON.stringify(inquiries));
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
window.showAllCars = showAllCars;
window.openCarDetails = openCarDetails;
window.showContactSellerForm = showContactSellerForm;
window.showSavedCars = showSavedCars;
window.showAccount = showAccount;
window.showSellerDashboard = showSellerDashboard;
window.showContactUs = showContactUs;
window.showAdminDashboard = showAdminDashboard;
window.applyMarketplaceControls = applyMarketplaceControls;
console.log("AutoNorth script v12 loaded");

const AUTONORTH_API = "/api";

async function apiRequest(path, options = {}) {
    const token = localStorage.getItem("autonorth_token");
    const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
    if (token) headers.Authorization = "Bearer " + token;
    const response = await fetch(AUTONORTH_API + path, { ...options, headers });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || "Request failed");
    return data;
}

function getAccount() {
    return JSON.parse(localStorage.getItem("autonorth_account") || "null");
}

function getCurrentUser() {
    return getAccount();
}

function saveAuthenticatedUser(user, token) {
    localStorage.setItem("autonorth_token", token);
    localStorage.setItem("autonorth_account", JSON.stringify({
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        role: user.role || "user",
        phoneVerified: Boolean(user.phone_verified)
    }));
}

function clearAuthenticatedUser() {
    localStorage.removeItem("autonorth_token");
    localStorage.removeItem("autonorth_account");
}

function showAccount() {
    closeAutoNorthModal();
    const a = getAccount();
    const hasSession = Boolean(localStorage.getItem("autonorth_token") && a);
    const m = document.createElement("div");
    m.id = "autonorth-modal";
    m.className = "site-modal";

    if (hasSession) {
        m.innerHTML = `<div class="account-modal">
            <button id="closeAccount" class="pricing-close">×</button>
            <p class="pricing-eyebrow">AUTONORTH ACCOUNT</p>
            <h2>Welcome, ${a.name || "AutoNorth member"}</h2>
            <p class="account-intro">Your account is connected to the AutoNorth server.</p>
            <div class="account-form">
                <label>Full Name<input value="${a.name || ""}" readonly></label>
                <label>Email<input value="${a.email || ""}" readonly></label>
                <label>Phone Number<input value="${a.phone || "Not added"}" readonly></label>
            </div>
            <div class="account-actions">
                <button id="sellerDashboard" class="account-secondary">Seller Dashboard</button>
                <button id="savedFromAccount" class="account-secondary">Saved Cars</button>
                <button id="phoneVerifyAccount" class="account-secondary">📱 Verify Phone</button>
                <button id="logoutAccount" class="account-danger">Sign Out</button>
            </div>
            <div id="accountSecurityStatus" style="margin-top:16px;padding:12px;border:1px solid #e5e7eb;border-radius:10px;background:#f9fafb;font-size:13px;">Checking security status...</div>
            <p class="account-demo-note">Phone verification adds another layer of protection for sellers and helps reduce fake accounts.</p>
        </div>`;
        document.body.appendChild(m);
        document.getElementById("closeAccount").onclick = closeAutoNorthModal;
        document.getElementById("sellerDashboard").onclick = () => { closeAutoNorthModal(); showSellerDashboard(); };
        document.getElementById("savedFromAccount").onclick = () => { closeAutoNorthModal(); showSavedCars(); };
        document.getElementById("logoutAccount").onclick = () => {
            clearAuthenticatedUser();
            closeAutoNorthModal();
            showAccount();
        };
        document.getElementById("phoneVerifyAccount").onclick = () => {
            closeAutoNorthModal();
            showPhoneVerification();
        };
        refreshSecurityStatus();
        return;
    }

    m.innerHTML = `<div class="account-modal">
        <button id="closeAccount" class="pricing-close">×</button>
        <p class="pricing-eyebrow">AUTONORTH ACCOUNT</p>
        <h2 id="accountTitle">Sign in to AutoNorth</h2>
        <p class="account-intro" id="accountIntro">Access your saved cars, listings and buyer inquiries.</p>
        <div style="display:flex;gap:8px;margin:18px 0;">
            <button type="button" id="loginTab" class="account-secondary" style="flex:1;">Sign In</button>
            <button type="button" id="registerTab" class="account-secondary" style="flex:1;">Create Account</button>
        </div>
        <form id="accountForm" class="account-form">
            <div id="nameField" style="display:none;">
                <label>Full Name<input name="name" autocomplete="name"></label>
            </div>
            <label>Email<input required type="email" name="email" autocomplete="email"></label>
            <div id="phoneField" style="display:none;">
                <label>Phone Number<input type="tel" name="phone" placeholder="+254..." autocomplete="tel"></label>
            </div>
            <label>Password<input required type="password" name="password" minlength="8" autocomplete="current-password"></label>
            <div id="accountError" style="display:none;color:#b91c1c;background:#fef2f2;border:1px solid #fecaca;padding:10px;border-radius:8px;font-size:13px;"></div>
            <button id="accountSubmit" class="pricing-button pricing-button-red">Sign In</button>
        </form>
        <p class="account-demo-note">Use at least 8 characters for your password. Your password is securely hashed on the server and is never stored in plain text.</p>
    </div>`;
    document.body.appendChild(m);

    const title = document.getElementById("accountTitle");
    const intro = document.getElementById("accountIntro");
    const nameField = document.getElementById("nameField");
    const phoneField = document.getElementById("phoneField");
    const nameInput = m.querySelector('input[name="name"]');
    const phoneInput = m.querySelector('input[name="phone"]');
    const passwordInput = m.querySelector('input[name="password"]');
    const submit = document.getElementById("accountSubmit");
    const error = document.getElementById("accountError");
    let mode = "login";

    const setMode = nextMode => {
        mode = nextMode;
        const registering = mode === "register";
        title.textContent = registering ? "Create your AutoNorth account" : "Sign in to AutoNorth";
        intro.textContent = registering
            ? "Create an account to save cars, sell vehicles and manage inquiries."
            : "Access your saved cars, listings and buyer inquiries.";
        nameField.style.display = registering ? "block" : "none";
        phoneField.style.display = registering ? "block" : "none";
        nameInput.required = registering;
        phoneInput.required = registering;
        passwordInput.autocomplete = registering ? "new-password" : "current-password";
        submit.textContent = registering ? "Create Account" : "Sign In";
        error.style.display = "none";
    };

    document.getElementById("closeAccount").onclick = closeAutoNorthModal;
    document.getElementById("loginTab").onclick = () => setMode("login");
    document.getElementById("registerTab").onclick = () => setMode("register");

    document.getElementById("accountForm").onsubmit = async event => {
        event.preventDefault();
        error.style.display = "none";
        submit.disabled = true;
        submit.textContent = mode === "register" ? "Creating..." : "Signing in...";
        const data = Object.fromEntries(new FormData(event.currentTarget));

        try {
            const result = mode === "register"
                ? await apiRequest("/auth/register", {
                    method: "POST",
                    body: JSON.stringify({ name: data.name, email: data.email, phone: data.phone, password: data.password })
                })
                : await apiRequest("/auth/login", {
                    method: "POST",
                    body: JSON.stringify({ email: data.email, password: data.password })
                });
            saveAuthenticatedUser(result.user, result.token);
            closeAutoNorthModal();
            showAccount();
        } catch (err) {
            error.textContent = err.message || "Unable to complete the request.";
            error.style.display = "block";
        } finally {
            submit.disabled = false;
            submit.textContent = mode === "register" ? "Create Account" : "Sign In";
        }
    };
}

async async function refreshSecurityStatus(){
    const box = document.getElementById("accountSecurityStatus");
    if (!box) return;
    try {
        const data = await apiRequest("/me/security");
        const verified = Boolean(data.phoneVerified);
        box.innerHTML = verified
            ? "📱 <strong>Phone verified</strong> — your account has completed phone verification."
            : "📱 <strong>Phone not verified</strong> — verify your number to strengthen seller security.";
    } catch (err) {
        box.textContent = "Security status could not be loaded.";
    }
}

async function showPhoneVerification(){
    closeAutoNorthModal();
    const account = getAccount();
    if (!account) { showAccount(); return; }

    const m = document.createElement("div");
    m.id = "autonorth-modal";
    m.className = "site-modal";
    m.innerHTML = `<div class="account-modal">
        <button id="closePhoneVerify" class="pricing-close">×</button>
        <p class="pricing-eyebrow">ACCOUNT SECURITY</p>
        <h2>Verify your phone</h2>
        <p class="account-intro">We'll send a one-time verification code to your phone number.</p>
        <form id="phoneSendForm" class="account-form">
            <label>Phone Number
                <input required type="tel" name="phone" value="${account.phone || ""}" placeholder="+254..." autocomplete="tel">
            </label>
            <div id="phoneVerifyError" style="display:none;color:#b91c1c;background:#fef2f2;border:1px solid #fecaca;padding:10px;border-radius:8px;font-size:13px;"></div>
            <button class="pricing-button pricing-button-red">Send Verification Code</button>
        </form>
        <div id="phoneCodeArea" style="display:none;margin-top:20px;">
            <label>Verification Code
                <input id="phoneCodeInput" inputmode="numeric" maxlength="6" placeholder="6-digit code">
            </label>
            <button id="verifyPhoneCode" type="button" class="pricing-button pricing-button-dark" style="margin-top:10px;">Verify Phone</button>
            <div id="devCodeNotice" style="display:none;margin-top:12px;padding:10px;border-radius:8px;background:#fff7ed;border:1px solid #fed7aa;font-size:13px;"></div>
        </div>
    </div>`;
    document.body.appendChild(m);

    document.getElementById("closePhoneVerify").onclick = closeAutoNorthModal;
    const error = document.getElementById("phoneVerifyError");
    const codeArea = document.getElementById("phoneCodeArea");
    const codeInput = document.getElementById("phoneCodeInput");
    const devNotice = document.getElementById("devCodeNotice");

    document.getElementById("phoneSendForm").onsubmit = async e => {
        e.preventDefault();
        error.style.display = "none";
        const phone = new FormData(e.currentTarget).get("phone");
        const button = e.currentTarget.querySelector("button");
        button.disabled = true;
        button.textContent = "Sending...";
        try {
            const result = await apiRequest("/phone/send-code", {
                method: "POST",
                body: JSON.stringify({ phone })
            });
            codeArea.style.display = "block";
            if (result.devCode) {
                devNotice.style.display = "block";
                devNotice.textContent = "Development test code: " + result.devCode + " (this is never returned in production).";
            }
        } catch (err) {
            error.textContent = err.message || "Could not send the verification code.";
            error.style.display = "block";
        } finally {
            button.disabled = false;
            button.textContent = "Send Verification Code";
        }
    };

    document.getElementById("verifyPhoneCode").onclick = async () => {
        error.style.display = "none";
        const code = codeInput.value.trim();
        if (!/^\d{6}$/.test(code)) {
            error.textContent = "Enter the 6-digit verification code.";
            error.style.display = "block";
            return;
        }
        const button = document.getElementById("verifyPhoneCode");
        button.disabled = true;
        button.textContent = "Verifying...";
        try {
            await apiRequest("/phone/verify", {
                method: "POST",
                body: JSON.stringify({ code })
            });
            const updated = getAccount() || {};
            updated.phone = String(new FormData(document.getElementById("phoneSendForm")).get("phone") || updated.phone || "");
            updated.phoneVerified = true;
            localStorage.setItem("autonorth_account", JSON.stringify(updated));
            closeAutoNorthModal();
            showAccount();
        } catch (err) {
            error.textContent = err.message || "Verification failed.";
            error.style.display = "block";
        } finally {
            button.disabled = false;
            button.textContent = "Verify Phone";
        }
    };
}

function showSellerDashboard(){
 closeAutoNorthModal();
 const token=localStorage.getItem("autonorth_token");
 const account=getAccount();
 if(!token||!account){
   showAccount();
   return;
 }

 const m=document.createElement("div");
 m.id="autonorth-modal";
 m.className="site-modal";
 m.innerHTML=`<div class="dashboard-modal">
   <button id="closeDashboard" class="pricing-close">×</button>
   <p class="pricing-eyebrow">SELLER CENTER</p><h2>Seller Dashboard</h2>
   <p class="account-intro">Loading your listings and buyer inquiries...</p>
 </div>`;
 document.body.appendChild(m);
 document.getElementById("closeDashboard").onclick=closeAutoNorthModal;

 try{
   const [listingData,inquiryData]=await Promise.all([
     apiRequest("/seller/listings"),
     apiRequest("/seller/inquiries")
   ]);
   const ls=listingData.listings||[];
   const iq=inquiryData.inquiries||[];
   const liveCount=ls.filter(x=>x.status==="live").length;

   const listings=ls.length?ls.map(x=>`<div class="dashboard-listing">
     <img src="${x.image||"https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80"}" alt="${x.make} ${x.model}">
     <div class="dashboard-listing-info"><strong>${x.year} ${x.make} ${x.model}</strong><span>${formatUSD(x.price)} • ${x.plan||"Basic"}</span><small>● ${x.status||"pending"}</small></div>
     <button class="dashboard-edit" data-id="${x.id}">Edit</button>
     <button class="dashboard-delete" data-id="${x.id}">Delete</button>
   </div>`).join(""):"<p class=\"empty-dashboard\">No listings yet. Start by selling your car.</p>";

   const inquiries=iq.length?iq.slice().reverse().map(x=>`<div class="inquiry-card"><strong>${x.make||""} ${x.model||""}</strong><span>${x.buyer_name||""} • ${x.buyer_email||""}</span><p>${x.message||""}</p><small>${x.created_at?new Date(x.created_at).toLocaleString():""}</small></div>`).join(""):"<p class=\"empty-dashboard\">No buyer inquiries yet.</p>";

   m.querySelector(".dashboard-modal").innerHTML=`<button id="closeDashboard" class="pricing-close">×</button>
     <p class="pricing-eyebrow">SELLER CENTER</p><h2>Seller Dashboard</h2>
     <p class="account-intro">Manage your listings and review messages from interested buyers.</p>
     <div class="dashboard-stats"><div><strong>${ls.length}</strong><span>Listings</span></div><div><strong>${liveCount}</strong><span>Live</span></div><div><strong>${iq.length}</strong><span>Inquiries</span></div></div>
     <div class="dashboard-section"><div class="dashboard-section-head"><h3>My Listings</h3><button id="dashboardSell" class="dashboard-small-btn">+ Sell a Car</button></div>${listings}</div>
     <div class="dashboard-section"><h3>Buyer Inquiries</h3>${inquiries}</div>`;
   document.getElementById("closeDashboard").onclick=closeAutoNorthModal;
   document.getElementById("dashboardSell").onclick=()=>{closeAutoNorthModal();showPricing()};
   m.querySelectorAll(".dashboard-delete").forEach(b=>b.onclick=()=>deleteUserListing(Number(b.dataset.id)));
   m.querySelectorAll(".dashboard-edit").forEach(b=>b.onclick=()=>{
      const x=ls.find(v=>Number(v.id)===Number(b.dataset.id));
      if(x){closeAutoNorthModal();showEditListingForm(x);}
   });
 }catch(err){
   m.querySelector(".dashboard-modal").innerHTML=`<button id="closeDashboard" class="pricing-close">×</button>
     <p class="pricing-eyebrow">SELLER CENTER</p><h2>Seller Dashboard</h2>
     <p class="account-intro" style="color:#b91c1c;">${err.message||"Could not load your seller data."}</p>
     <button id="retryDashboard" class="pricing-button pricing-button-red">Try Again</button>`;
   document.getElementById("closeDashboard").onclick=closeAutoNorthModal;
   document.getElementById("retryDashboard").onclick=()=>showSellerDashboard();
 }
}
function deleteUserListing(id){const ls=JSON.parse(localStorage.getItem("autonorth_user_listings")||"[]").filter(x=>x.id!==id);localStorage.setItem("autonorth_user_listings",JSON.stringify(ls));const i=cars.findIndex(x=>x.id===id);if(i>=0)cars.splice(i,1);displayCars();showSellerDashboard();}
function adminRemoveListing(id){const ls=JSON.parse(localStorage.getItem("autonorth_user_listings")||"[]").filter(x=>x.id!==id);localStorage.setItem("autonorth_user_listings",JSON.stringify(ls));const i=cars.findIndex(x=>x.id===id);if(i>=0)cars.splice(i,1);displayCars();showAdminDashboard();}

function showEditListingForm(x){
 closeAutoNorthModal();const m=document.createElement("div");m.id="autonorth-modal";m.className="site-modal";
 m.innerHTML="<div class=\"edit-listing-modal\"><button id=\"closeEdit\" class=\"pricing-close\">×</button><p class=\"pricing-eyebrow\">EDIT LISTING</p><h2>Update your vehicle</h2><form id=\"editForm\" class=\"edit-listing-form\"><label>Make<input required name=\"make\" value=\""+x.make+"\"></label><label>Model<input required name=\"model\" value=\""+x.model+"\"></label><label>Year<input required type=\"number\" name=\"year\" value=\""+x.year+"\"></label><label>Price<input required type=\"number\" name=\"price\" value=\""+x.price+"\"></label><label>Mileage<input required type=\"number\" name=\"mileage\" value=\""+x.mileage+"\"></label><label>Location<select name=\"location\"><option "+(x.location==="United States"?"selected":"")+">United States</option><option "+(x.location==="Canada"?"selected":"")+">Canada</option></select></label><label>City / State / Province<input required name=\"city\" value=\""+x.city+"\"></label><label>Fuel<select name=\"fuel\"><option>Gasoline</option><option>Diesel</option><option>Hybrid</option><option>Electric</option></select></label><label>Transmission<select name=\"transmission\"><option>Automatic</option><option>Manual</option></select></label><label class=\"full-field\">Photo URL<input name=\"image\" value=\""+x.image+"\"></label><label class=\"full-field\">Description<textarea name=\"description\">"+(x.description||"")+"</textarea></label><button class=\"pricing-button pricing-button-red full-field\">Save Changes</button></form></div>";
 document.body.appendChild(m);document.getElementById("closeEdit").onclick=closeAutoNorthModal;
 document.getElementById("editForm").onsubmit=e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget));const u={...x,make:d.make,model:d.model,year:Number(d.year),price:Number(d.price),mileage:Number(d.mileage),location:normalizeLocation(d.location),city:d.city,fuel:d.fuel,transmission:d.transmission,image:d.image||x.image,description:d.description||x.description};const ls=JSON.parse(localStorage.getItem("autonorth_user_listings")||"[]").map(v=>v.id===x.id?u:v);localStorage.setItem("autonorth_user_listings",JSON.stringify(ls));const i=cars.findIndex(v=>v.id===x.id);if(i>=0)cars[i]=u;displayCars();closeAutoNorthModal();showSellerDashboard();};
}

function showContactUs(){
 closeAutoNorthModal();const m=document.createElement("div");m.id="autonorth-modal";m.className="site-modal";m.innerHTML="<div class=\"contact-modal\"><button id=\"closeContact\" class=\"pricing-close\">×</button><p class=\"pricing-eyebrow\">CONTACT AUTONORTH</p><h2>How can we help?</h2><p class=\"account-intro\">Send the AutoNorth team a message. This demo saves it locally.</p><form id=\"contactForm\" class=\"account-form\"><label>Name<input required name=\"name\"></label><label>Email<input required type=\"email\" name=\"email\"></label><label>Message<textarea required name=\"message\" rows=\"5\"></textarea></label><button class=\"pricing-button pricing-button-red\">Send Message</button></form></div>";document.body.appendChild(m);document.getElementById("closeContact").onclick=closeAutoNorthModal;
 document.getElementById("contactForm").onsubmit=e=>{e.preventDefault();const d=Object.fromEntries(new FormData(e.currentTarget));const a=JSON.parse(localStorage.getItem("autonorth_contact_messages")||"[]");a.push({id:Date.now(),...d,createdAt:new Date().toISOString()});localStorage.setItem("autonorth_contact_messages",JSON.stringify(a));m.querySelector(".contact-modal").innerHTML="<div class=\"contact-success\"><div>✓</div><h2>Message received</h2><p>Thanks, "+d.name+". Your message has been saved in this demo.</p><button id=\"contactDone\" class=\"pricing-button pricing-button-dark\">Done</button></div>";document.getElementById("contactDone").onclick=closeAutoNorthModal;};
}

function showAdminDashboard(){
 if (localStorage.getItem("autonorth_admin_demo_enabled") !== "true") { console.warn("Admin dashboard is disabled in the public build."); return; }
 closeAutoNorthModal();const ls=JSON.parse(localStorage.getItem("autonorth_user_listings")||"[]");const iq=JSON.parse(localStorage.getItem("autonorth_inquiries")||"[]");const cm=JSON.parse(localStorage.getItem("autonorth_contact_messages")||"[]");const a=getAccount();const m=document.createElement("div");m.id="autonorth-modal";m.className="site-modal";
 let rows=ls.length?ls.map(x=>"<div class=\"dashboard-listing\"><img src=\""+x.image+"\"><div class=\"dashboard-listing-info\"><strong>"+x.year+" "+x.make+" "+x.model+"</strong><span>"+formatUSD(x.price)+" • "+x.plan+" • Live</span></div><button class=\"dashboard-delete admin-remove\" data-id=\""+x.id+"\">Remove</button></div>").join(""):"<p class=\"empty-dashboard\">No seller listings.</p>";
 let inqs=iq.length?iq.map(x=>"<div class=\"inquiry-card\"><strong>"+x.vehicle+"</strong><span>"+x.name+" • "+x.email+"</span><p>"+x.message+"</p></div>").join(""):"<p class=\"empty-dashboard\">No buyer inquiries.</p>";
 let msgs=cm.length?cm.map(x=>"<div class=\"inquiry-card\"><strong>"+x.name+"</strong><span>"+x.email+"</span><p>"+x.message+"</p></div>").join(""):"<p class=\"empty-dashboard\">No contact messages.</p>";
 m.innerHTML="<div class=\"dashboard-modal admin-dashboard\"><button id=\"closeAdmin\" class=\"pricing-close\">×</button><p class=\"pricing-eyebrow\">ADMIN DEMO</p><h2>AutoNorth Admin Dashboard</h2><p class=\"account-intro\">Demo management tools. Real server-side admin security is required before launch.</p><div class=\"dashboard-stats\"><div><strong>"+cars.length+"</strong><span>Cars</span></div><div><strong>"+ls.length+"</strong><span>Seller Listings</span></div><div><strong>"+(a?1:0)+"</strong><span>Demo Users</span></div><div><strong>"+(iq.length+cm.length)+"</strong><span>Messages</span></div></div><div class=\"dashboard-section\"><h3>Seller Listings</h3>"+rows+"</div><div class=\"dashboard-section\"><h3>Buyer Inquiries</h3>"+inqs+"</div><div class=\"dashboard-section\"><h3>Contact Messages</h3>"+msgs+"</div></div>";
 document.body.appendChild(m);document.getElementById("closeAdmin").onclick=closeAutoNorthModal;m.querySelectorAll(".admin-remove").forEach(b=>b.onclick=()=>deleteUserListing(Number(b.dataset.id)));
}