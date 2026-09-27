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
        image: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?auto=format&fit=crop&w=900&q=80",
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
        image: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?auto=format&fit=crop&w=900&q=80",
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
        image: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&w=900&q=80",
        color: "Red",
        drivetrain: "All-Wheel Drive",
        description: "Low-mileage Tesla Model 3 with electric performance, modern technology and a clean interior."
    }
];

function displayCars(list = cars) {
    const grid = document.querySelector(".car-grid");
    if (!grid) return;

    if (!list.length) {
        grid.innerHTML = "<p>No cars found.</p>";
        return;
    }

    grid.innerHTML = list.map(car => `
        <article class="car-card" data-car-id="${car.id}" style="cursor:pointer;">
            <div class="car-image">
                <img src="${car.image}" alt="${car.year} ${car.make} ${car.model}">
            </div>
            <div class="car-info">
                <p class="car-year">${car.year}</p>
                <h3>${car.make} ${car.model}</h3>
                <p class="car-details">${car.mileage.toLocaleString()} miles • ${car.transmission} • ${car.fuel}</p>
                <div class="car-bottom">
                    <strong>$${car.price.toLocaleString()}</strong>
                    <span>${car.city}, ${car.location}</span>
                </div>
                <button type="button" class="view-details-btn" data-car-id="${car.id}">View Details</button>
            </div>
        </article>
    `).join("");
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
    overlay.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,.8);z-index:999999;display:flex;align-items:center;justify-content:center;padding:20px;";

    overlay.innerHTML = `
        <div style="background:white;color:#111;max-width:850px;width:100%;max-height:90vh;overflow:auto;border-radius:16px;padding:25px;position:relative;">
            <button type="button" id="closeVehicleDetails" style="position:absolute;right:15px;top:15px;width:40px;height:40px;border:0;border-radius:50%;font-size:25px;cursor:pointer;">×</button>
            <img src="${car.image}" alt="${car.make} ${car.model}" style="width:100%;height:350px;object-fit:cover;border-radius:10px;">
            <p style="color:#e63946;font-weight:bold;margin-top:20px;">${car.year}</p>
            <h2 style="font-size:34px;margin:5px 0;">${car.make} ${car.model}</h2>
            <h3 style="color:#e63946;">$${car.price.toLocaleString()}</h3>
            <p><b>Mileage:</b> ${car.mileage.toLocaleString()} miles</p>
            <p><b>Transmission:</b> ${car.transmission}</p>
            <p><b>Fuel:</b> ${car.fuel}</p>
            <p><b>Color:</b> ${car.color}</p>
            <p><b>Drivetrain:</b> ${car.drivetrain}</p>
            <p><b>Location:</b> ${car.city}, ${car.location}</p>
            <h3>Vehicle Description</h3>
            <p>${car.description}</p>
            <button type="button" id="contactSellerButton" style="width:100%;padding:15px;border:0;border-radius:8px;background:#e63946;color:white;font-weight:bold;cursor:pointer;">Contact Seller</button>
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
    displayCars();
});


function closeAutoNorthModal() {
    const modal = document.getElementById("autonorth-modal");
    if (modal) modal.remove();
}

function showPricing() {
    closeAutoNorthModal();

    const modal = document.createElement("div");
    modal.id = "autonorth-modal";
    modal.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,.78);z-index:999999;display:flex;align-items:center;justify-content:center;padding:20px;overflow:auto;";

    modal.innerHTML = `
        <div style="background:#fff;color:#111827;width:100%;max-width:980px;max-height:92vh;overflow:auto;border-radius:18px;padding:32px;position:relative;">
            <button type="button" id="closePricingModal" aria-label="Close" style="position:absolute;right:16px;top:16px;width:42px;height:42px;border:0;border-radius:50%;background:#f3f4f6;font-size:26px;cursor:pointer;">×</button>
            <p style="color:#e63946;font-size:12px;font-weight:800;letter-spacing:2px;margin-bottom:8px;">SELL WITH AUTONORTH</p>
            <h2 style="font-size:34px;margin-bottom:8px;">Choose a listing plan</h2>
            <p style="color:#6b7280;margin-bottom:25px;">Create your vehicle listing first. Payment processing can be connected when the marketplace backend is ready.</p>

            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:18px;">
                <div style="border:1px solid #e5e7eb;border-radius:14px;padding:24px;">
                    <h3>Basic</h3>
                    <p style="font-size:30px;font-weight:800;margin:12px 0;">$19.99</p>
                    <p style="color:#6b7280;line-height:1.6;">Standard vehicle listing with essential details and buyer visibility.</p>
                    <button type="button" class="choose-plan" data-plan="Basic" data-price="19.99" style="width:100%;margin-top:20px;padding:13px;border:0;border-radius:8px;background:#111827;color:white;font-weight:800;cursor:pointer;">Choose Basic</button>
                </div>

                <div style="border:2px solid #e63946;border-radius:14px;padding:24px;position:relative;">
                    <span style="position:absolute;top:-12px;left:20px;background:#e63946;color:white;padding:5px 9px;border-radius:5px;font-size:10px;font-weight:800;">POPULAR</span>
                    <h3>Featured</h3>
                    <p style="font-size:30px;font-weight:800;margin:12px 0;">$39.99</p>
                    <p style="color:#6b7280;line-height:1.6;">More visibility for your vehicle with featured placement.</p>
                    <button type="button" class="choose-plan" data-plan="Featured" data-price="39.99" style="width:100%;margin-top:20px;padding:13px;border:0;border-radius:8px;background:#e63946;color:white;font-weight:800;cursor:pointer;">Choose Featured</button>
                </div>

                <div style="border:1px solid #e5e7eb;border-radius:14px;padding:24px;">
                    <h3>Premium</h3>
                    <p style="font-size:30px;font-weight:800;margin:12px 0;">$69.99</p>
                    <p style="color:#6b7280;line-height:1.6;">Premium exposure designed for sellers who want maximum visibility.</p>
                    <button type="button" class="choose-plan" data-plan="Premium" data-price="69.99" style="width:100%;margin-top:20px;padding:13px;border:0;border-radius:8px;background:#111827;color:white;font-weight:800;cursor:pointer;">Choose Premium</button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    document.getElementById("closePricingModal").onclick = closeAutoNorthModal;
    modal.onclick = event => {
        if (event.target === modal) closeAutoNorthModal();
    };
}

function showListingForm(plan = "Basic", planPrice = "19.99") {
    closeAutoNorthModal();

    const modal = document.createElement("div");
    modal.id = "autonorth-modal";
    modal.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,.78);z-index:999999;display:flex;align-items:center;justify-content:center;padding:20px;overflow:auto;";

    modal.innerHTML = `
        <div style="background:#fff;color:#111827;width:100%;max-width:760px;max-height:92vh;overflow:auto;border-radius:18px;padding:30px;position:relative;">
            <button type="button" id="closeListingModal" aria-label="Close" style="position:absolute;right:16px;top:16px;width:42px;height:42px;border:0;border-radius:50%;background:#f3f4f6;font-size:26px;cursor:pointer;">×</button>

            <p style="color:#e63946;font-size:12px;font-weight:800;letter-spacing:2px;margin-bottom:8px;">CREATE YOUR LISTING</p>
            <h2 style="font-size:32px;margin-bottom:5px;">List your car</h2>
            <p style="color:#6b7280;margin-bottom:22px;">Selected plan: <strong>${plan}</strong> — ${planPrice}</p>

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

        closeAutoNorthModal();

        const confirmation = document.createElement("div");
        confirmation.id = "autonorth-modal";
        confirmation.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,.78);z-index:999999;display:flex;align-items:center;justify-content:center;padding:20px;";
        confirmation.innerHTML = `
            <div style="background:white;color:#111827;max-width:520px;width:100%;border-radius:18px;padding:32px;text-align:center;">
                <div style="font-size:48px;margin-bottom:10px;">✓</div>
                <h2>Listing details saved</h2>
                <p style="color:#6b7280;line-height:1.6;margin:14px 0 22px;">Your ${vehicle.year} ${vehicle.make} ${vehicle.model} listing is ready for the ${plan} plan. The next production step is connecting secure payment and a database.</p>
                <button type="button" id="closeConfirmation" style="padding:13px 24px;border:0;border-radius:8px;background:#e63946;color:white;font-weight:800;cursor:pointer;">Done</button>
            </div>
        `;
        document.body.appendChild(confirmation);
        document.getElementById("closeConfirmation").onclick = closeAutoNorthModal;
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
console.log("AutoNorth script v11 loaded");
