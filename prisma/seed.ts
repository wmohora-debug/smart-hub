/* eslint-disable no-console */
import { PrismaClient, AdminRole, OrderStatus, PaymentStatus } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

async function main() {
  console.log("🌱 Starting Smart Food Hub Database Seed (Safe & Idempotent)...");

  // 1. Seed Restaurant Entity (Non-Destructive: Never overwrite uploaded banner or logo)
  const existingRestaurant = await prisma.restaurant.findFirst({
    where: {
      OR: [{ slug: "smart-food-hub" }, { slug: "smart-tech-food-hub" }],
    },
  });

  const restaurant = existingRestaurant
    ? await prisma.restaurant.update({
        where: { id: existingRestaurant.id },
        data: {
          name: "Smart Food Hub",
          slug: "smart-food-hub",
          metaTitle: "Smart Food Hub — Artisanal Digital Menu & Bistro",
        },
      })
    : await prisma.restaurant.create({
        data: {
          slug: "smart-food-hub",
          name: "Smart Food Hub",
          tagline: "Premium Artisanal Digital Menu & Culinary Bistro",
          description: "Premium Artisanal Digital Menu & Culinary Bistro by Smart Tech Namchi",
          longDescription: "Smart Food Hub is Namchi's premier dining destination, offering an exquisite fusion of local Himalayan flavors and continental fine dining.",
          address: "Smart Tech Namchi Central, Namchi, Sikkim",
          city: "Namchi",
          state: "Sikkim",
          country: "India",
          postalCode: "737126",
          phone: "+91 98000 12345",
          whatsapp: "+91 98000 12345",
          email: "contact@smartfoodhub.com",
          website: "https://smartfoodhub.com",
          logo: "/images/logo-placeholder.png",
          banner: "/images/banner-placeholder.png",
          favicon: "/favicon.ico",
          themeColor: "#D97706",
          openingTime: "10:00 AM",
          closingTime: "10:30 PM",
          autoOpen: true,
          isOverrideClosed: false,
          prepTime: "15-20 min",
          deliveryTime: "30-45 min",
          facebookUrl: "https://facebook.com/smartfoodhub",
          instagramUrl: "https://instagram.com/smartfoodhub",
          twitterUrl: "https://twitter.com/smartfoodhub",
          youtubeUrl: "https://youtube.com/@smartfoodhub",
          googleMapsUrl: "https://maps.google.com/?q=Smart+Tech+Namchi",
          metaTitle: "Smart Food Hub — Artisanal Digital Menu & Bistro",
          metaDescription: "Explore our hand-crafted menu prepared by master chefs using organic, locally sourced ingredients from Namchi Valley.",
          keywords: "Smart Food Hub, Smart Tech, Namchi, Restaurant, Digital Menu, Momos, Pizza, Fine Dining",
      currency: "INR",
      timezone: "Asia/Kolkata",
      openingHours: {
        monday: "10:00 - 22:30",
        tuesday: "10:00 - 22:30",
        wednesday: "10:00 - 22:30",
        thursday: "10:00 - 22:30",
        friday: "10:00 - 23:00",
        saturday: "10:00 - 23:00",
        sunday: "10:00 - 22:30",
      },
      theme: {
        mode: "dark",
        primaryColor: "amber",
      },
      isActive: true,
      isDeleted: false,
    },
  });

  console.log(`✅ Restaurant verified: ${restaurant.name} (${restaurant.id})`);

  // 2. Seed Restaurant Settings (Non-Destructive)
  const settings = await prisma.restaurantSettings.upsert({
    where: { restaurantId: restaurant.id },
    update: {
      // Do NOT overwrite user-updated taxRate or serviceCharge
    },
    create: {
      restaurantId: restaurant.id,
      taxRate: 5.0,
      serviceCharge: 0.0,
      currency: "INR",
      themeConfig: { accent: "gold", border: "warm-stone" },
      brandingJson: { headerTitle: "Smart Food Hub", footerTagline: "Smart Tech Namchi" },
    },
  });

  console.log(`✅ Restaurant Settings verified for ID: ${settings.restaurantId}`);

  // 3. Seed Admin User (Non-Destructive)
  const adminPasswordHash = hashPassword("admin123");
  const adminUser = await prisma.adminUser.upsert({
    where: { email: "admin@smarttechfoodhub.com" },
    update: {},
    create: {
      restaurantId: restaurant.id,
      email: "admin@smarttechfoodhub.com",
      passwordHash: adminPasswordHash,
      role: AdminRole.RESTAURANT_OWNER,
      isActive: true,
      isDeleted: false,
    },
  });

  console.log(`✅ Admin User verified: ${adminUser.email} (${adminUser.role})`);

  // 4. Seed Tables (Non-Destructive)
  const existingTable = await prisma.table.findFirst({
    where: { restaurantId: restaurant.id, slug: "table-1" },
  });

  const defaultTable = existingTable
    ? existingTable
    : await prisma.table.create({
        data: {
          restaurantId: restaurant.id,
          name: "Table 1",
          tableNumber: 1,
          capacity: 4,
          zone: "Main Dining",
          slug: "table-1",
          qrCodeImage: "data:image/png;base64,sampleqrcode",
        },
      });

  // 5. Seed Categories & Menu Items Data (Non-Destructive: Skip existing records to preserve hard deletes and edits)
  const seedData = [
    {
      name: "Starters",
      description: "Crispy appetizers and wood-smoked small bites",
      displayOrder: 1,
      dishes: [
        { name: "Tandoori Paneer Tikka", description: "Cottage cheese cubes marinated in Kashmiri chili, hung curd, and mustard oil, charred in tandoor.", price: 340, isVeg: true, isPopular: true, isChefSpecial: false },
        { name: "Crispy Honey Chili Lotus Stem", description: "Thinly sliced lotus root tossed in spicy honey garlic sauce with toasted sesame seeds.", price: 310, isVeg: true, isPopular: false, isChefSpecial: true },
        { name: "Smoked Chicken Wings", description: "Hickory-smoked chicken wings tossed in fiery Himalayan Dalle BBQ reduction.", price: 390, isVeg: false, isPopular: true, isChefSpecial: false },
      ],
    },
    {
      name: "Momos",
      description: "Hand-folded Himalayan dumplings served with secret Dalle chili dip",
      displayOrder: 2,
      dishes: [
        { name: "Classic Steamed Chicken Momos", description: "Traditional minced chicken dumplings infused with spring onion and ginger, served with Dalle chutney.", price: 220, isVeg: false, isPopular: true, isChefSpecial: false },
        { name: "Pan-Fried Cheese & Vegetable Momos", description: "Crispy bottom dumplings stuffed with local Sikkim cheese, sweet corn, and cabbage.", price: 240, isVeg: true, isPopular: true, isChefSpecial: false },
      ],
    },
  ];

  let totalCategoriesSeeded = 0;
  let totalDishesSeeded = 0;

  for (const catData of seedData) {
    let category = await prisma.category.findFirst({
      where: { restaurantId: restaurant.id, name: catData.name },
    });

    if (!category) {
      category = await prisma.category.create({
        data: {
          restaurantId: restaurant.id,
          name: catData.name,
          description: catData.description,
          displayOrder: catData.displayOrder,
          isActive: true,
          isDeleted: false,
        },
      });
      totalCategoriesSeeded++;
    }

    for (const [idx, dish] of catData.dishes.entries()) {
      const existingDish = await prisma.menuItem.findFirst({
        where: { restaurantId: restaurant.id, categoryId: category.id, name: dish.name },
      });

      if (!existingDish) {
        await prisma.menuItem.create({
          data: {
            restaurantId: restaurant.id,
            categoryId: category.id,
            name: dish.name,
            description: dish.description,
            price: dish.price,
            image: "/images/food-placeholder.png",
            isVeg: dish.isVeg,
            isPopular: dish.isPopular,
            isChefSpecial: dish.isChefSpecial,
            displayOrder: idx + 1,
            isActive: true,
            isDeleted: false,
          },
        });
        totalDishesSeeded++;
      }
    }
  }

  console.log(`✅ Categories verified: ${totalCategoriesSeeded} created`);
  console.log(`✅ Menu Items verified: ${totalDishesSeeded} created`);

  // 6. Seed Sample Orders (Non-Destructive)
  const existingOrderCount = await prisma.order.count({
    where: { restaurantId: restaurant.id },
  });

  if (existingOrderCount === 0) {
    const paneerTikka = await prisma.menuItem.findFirst({ where: { name: "Tandoori Paneer Tikka" } });
    const chickenMomos = await prisma.menuItem.findFirst({ where: { name: "Classic Steamed Chicken Momos" } });

    if (paneerTikka && chickenMomos) {
      const p1 = Number(paneerTikka.price);
      const p2 = Number(chickenMomos.price);
      const subtotal = p1 * 1 + p2 * 2;
      const taxRate = 5.0;
      const taxAmount = Math.round(subtotal * 0.05 * 100) / 100;
      const totalAmount = subtotal + taxAmount;

      await prisma.order.create({
        data: {
          restaurantId: restaurant.id,
          tableId: defaultTable.id,
          orderNumber: "#ORD-1001",
          customerName: "Tashi Bhutia",
          customerPhone: "+91 98000 54321",
          status: OrderStatus.PENDING,
          paymentStatus: PaymentStatus.UNPAID,
          paymentMethod: "CASH",
          subtotal,
          taxRate,
          taxAmount,
          serviceCharge: 0.0,
          serviceChargeAmount: 0.0,
          totalAmount,
          notes: "Extra spicy Dalle chutney please",
          items: {
            create: [
              {
                menuItemId: paneerTikka.id,
                name: paneerTikka.name,
                price: p1,
                quantity: 1,
                totalPrice: p1,
              },
              {
                menuItemId: chickenMomos.id,
                name: chickenMomos.name,
                price: p2,
                quantity: 2,
                totalPrice: p2 * 2,
              },
            ],
          },
        },
      });
      console.log("✅ Sample Order #ORD-1001 verified.");
    }
  }

  console.log("🚀 Safe & Idempotent Database Seeding Completed Successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
