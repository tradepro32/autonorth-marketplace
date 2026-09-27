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


function displayCars(carList = cars) {
    const carGrid = document.querySelector(".car-grid");

    if (!carGrid) {
        return;
    }

    if (carList.length === 0) {
        carGrid.innerHTML = `
            <p style="grid-column: 1 / -1; text-align: center;">
                No cars found.
            </p>
        `;
        return;
    }

    carGrid.innerHTML = carList.map(function(car) {
        return `
            <article class="car-card" data-car-id="${car.id}">
                <div class="car-image">
                    <img 
                        src="${car.image}" 
                        alt="${car.year} ${car.make} ${car.model}"
                    >
                </div>

                <div class="car-info">
                    <p class="car-year">${car.year}</p>

                    <h3>${car.make} ${car.model}</h3>

                    <p class="car-details">
                        ${car.mileage.toLocaleString()} miles •
                        ${car.transmission} •
                        ${car.fuel}
                    </p>

                    <div class="car-bottom">
                        <strong>$${car.price.toLocaleString()}</strong>
                        <span>${car.city}, ${car.location}</span>
                    </div>
                </div>
            </article>
        `;
    }).join("");

    document.querySelectorAll(".car-card").forEach(function(card) {
        card.addEventListener("click", function() {
            const carId = Number(card.dataset.carId);
            openCarDetails(carId);
        });
    });
}


function searchCars() {
    const makeElement = document.getElementById("make");
    const modelElement = document.getElementById("model");
    const priceElement = document.getElementById("price");
    const locationElement = document.getElementById("location");

    const make = makeElement ? makeElement.value : "";
    const model = modelElement ? modelElement.value.toLowerCase().trim() : "";
    const price = priceElement ? priceElement.value : "";
    const location = locationElement ? locationElement.value : "";

    const results = cars.filter(function(car) {

        const matchesMake =
            !make || car.make === make;

        const matchesModel =
            !model || car.model.toLowerCase().includes(model);

        const matchesPrice =
            !price || car.price <= Number(price);

        const matchesLocation =
            !location ||
            (location === "United States" && car.location === "USA") ||
            (location === "Canada" && car.location === "Canada");

        return (
            matchesMake &&
            matchesModel &&
            matchesPrice &&
            matchesLocation
        );
    });

    displayCars(results);
}


function openCarDetails(carId) {
    const car = cars.find(function(item) {
        return item.id === carId;
    });

    if (!car) {
        return;
    }

    const detailsWindow = document.createElement("div");

    detailsWindow.className = "car-details-window";

    detailsWindow.innerHTML = `
        <div class="car-details-box">

            <button class="close-details">
                ×
            </button>

            <img 
                src="${car.image}" 
                alt="${car.year} ${car.make} ${car.model}"
                class="details-image"
            >

            <div class="details-content">

                <p class="car-year">${car.year}</p>

                <h2>${car.make} ${car.model}</h2>

                <h3>$${car.price.toLocaleString()}</h3>

                <div class="details-grid">

                    <div>
                        <strong>Mileage</strong>
                        <span>${car.mileage.toLocaleString()} miles</span>
                    </div>

                    <div>
                        <strong>Transmission</strong>
                        <span>${car.transmission}</span>
                    </div>

                    <div>
                        <strong>Fuel</strong>
                        <span>${car.fuel}</span>
                    </div>

                    <div>
                        <strong>Color</strong>
                        <span>${car.color}</span>
                    </div>

                    <div>
                        <strong>Drivetrain</strong>
                        <span>${car.drivetrain}</span>
                    </div>

                    <div>
                        <strong>Location</strong>
                        <span>${car.city}, ${car.location}</span>
                    </div>

                </div>

                <h3>Vehicle Description</h3>

                <p class="details-description">
                    ${car.description}
                </p>

                <button class="contact-seller">
                    Contact Seller
                </button>

            </div>
        </div>
    `;

    document.body.appendChild(detailsWindow);

    detailsWindow.querySelector(".close-details").addEventListener("click", function() {
        detailsWindow.remove();
    });

    detailsWindow.addEventListener("click", function(event) {
        if (event.target === detailsWindow) {
            detailsWindow.remove();
        }
    });

    detailsWindow.querySelector(".contact-seller").addEventListener("click", function() {
        alert("Seller contact feature coming next.");
    });
}


document.addEventListener("DOMContentLoaded", function() {
    displayCars();
});