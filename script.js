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
        alert("Seller contact feature coming next.");
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
