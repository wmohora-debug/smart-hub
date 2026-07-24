/* eslint-disable no-console */
import { PrismaClient, AdminRole } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, "sha512").toString("hex");
  return `${salt}:${hash}`;
}

async function main() {
  console.log("🌱 Starting Smart Tech Food Hub Database Seed...");

  // 1. Seed Restaurant Entity (Idempotent via slug upsert)
  const restaurant = await prisma.restaurant.upsert({
    where: { slug: "smart-tech-food-hub" },
    update: {
      name: "Smart Tech Food Hub",
      tagline: "Premium Artisanal Digital Menu & Culinary Bistro",
      description: "Premium Artisanal Digital Menu & Culinary Bistro by Smart Tech Namchi",
      longDescription: "Smart Tech Food Hub is Namchi's premier dining destination, offering an exquisite fusion of local Himalayan flavors and continental fine dining.",
      address: "Smart Tech Namchi Central, Namchi, Sikkim",
      city: "Namchi",
      state: "Sikkim",
      country: "India",
      postalCode: "737126",
      phone: "+91 98000 12345",
      whatsapp: "+91 98000 12345",
      email: "contact@smarttechfoodhub.com",
      website: "https://smarttechfoodhub.com",
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
      facebookUrl: "https://facebook.com/smarttechfoodhub",
      instagramUrl: "https://instagram.com/smarttechfoodhub",
      twitterUrl: "https://twitter.com/smarttechfoodhub",
      youtubeUrl: "https://youtube.com/@smarttechfoodhub",
      googleMapsUrl: "https://maps.google.com/?q=Smart+Tech+Namchi",
      metaTitle: "Smart Tech Food Hub — Artisanal Digital Menu & Bistro",
      metaDescription: "Explore our hand-crafted menu prepared by master chefs using organic, locally sourced ingredients from Namchi Valley.",
      keywords: "Smart Tech, Namchi, Restaurant, Digital Menu, Momos, Pizza, Fine Dining",
      currency: "INR",
      timezone: "Asia/Kolkata",
      isActive: true,
      isDeleted: false,
    },
    create: {
      slug: "smart-tech-food-hub",
      name: "Smart Tech Food Hub",
      tagline: "Premium Artisanal Digital Menu & Culinary Bistro",
      description: "Premium Artisanal Digital Menu & Culinary Bistro by Smart Tech Namchi",
      longDescription: "Smart Tech Food Hub is Namchi's premier dining destination, offering an exquisite fusion of local Himalayan flavors and continental fine dining.",
      address: "Smart Tech Namchi Central, Namchi, Sikkim",
      city: "Namchi",
      state: "Sikkim",
      country: "India",
      postalCode: "737126",
      phone: "+91 98000 12345",
      whatsapp: "+91 98000 12345",
      email: "contact@smarttechfoodhub.com",
      website: "https://smarttechfoodhub.com",
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
      facebookUrl: "https://facebook.com/smarttechfoodhub",
      instagramUrl: "https://instagram.com/smarttechfoodhub",
      twitterUrl: "https://twitter.com/smarttechfoodhub",
      youtubeUrl: "https://youtube.com/@smarttechfoodhub",
      googleMapsUrl: "https://maps.google.com/?q=Smart+Tech+Namchi",
      metaTitle: "Smart Tech Food Hub — Artisanal Digital Menu & Bistro",
      metaDescription: "Explore our hand-crafted menu prepared by master chefs using organic, locally sourced ingredients from Namchi Valley.",
      keywords: "Smart Tech, Namchi, Restaurant, Digital Menu, Momos, Pizza, Fine Dining",
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

  console.log(`✅ Restaurant seeded: ${restaurant.name} (${restaurant.id})`);

  // 2. Seed Restaurant Settings (Idempotent via restaurantId upsert)
  const settings = await prisma.restaurantSettings.upsert({
    where: { restaurantId: restaurant.id },
    update: {
      taxRate: 5.0,
      serviceCharge: 0.0,
      currency: "INR",
    },
    create: {
      restaurantId: restaurant.id,
      taxRate: 5.0,
      serviceCharge: 0.0,
      currency: "INR",
      themeConfig: { accent: "gold", border: "warm-stone" },
      brandingJson: { headerTitle: "Smart Tech Food Hub", footerTagline: "Smart Tech Namchi" },
    },
  });

  console.log(`✅ Restaurant Settings seeded for ID: ${settings.restaurantId}`);

  // 3. Seed Admin User (Idempotent via email upsert)
  const adminPasswordHash = hashPassword("admin123");
  const adminUser = await prisma.adminUser.upsert({
    where: { email: "admin@smarttechfoodhub.com" },
    update: {
      restaurantId: restaurant.id,
      role: AdminRole.RESTAURANT_OWNER,
      isActive: true,
    },
    create: {
      restaurantId: restaurant.id,
      email: "admin@smarttechfoodhub.com",
      passwordHash: adminPasswordHash,
      role: AdminRole.RESTAURANT_OWNER,
      isActive: true,
      isDeleted: false,
    },
  });

  console.log(`✅ Admin User seeded: ${adminUser.email} (${adminUser.role})`);

  // 4. Seed Categories & Menu Items Data
  const seedData = [
    {
      name: "Starters",
      description: "Crispy appetizers and wood-smoked small bites",
      displayOrder: 1,
      dishes: [
        { name: "Tandoori Paneer Tikka", description: "Cottage cheese cubes marinated in Kashmiri chili, hung curd, and mustard oil, charred in tandoor.", price: 340, isVeg: true, isPopular: true, isChefSpecial: false },
        { name: "Crispy Honey Chili Lotus Stem", description: "Thinly sliced lotus root tossed in spicy honey garlic sauce with toasted sesame seeds.", price: 310, isVeg: true, isPopular: false, isChefSpecial: true },
        { name: "Smoked Chicken Wings", description: "Hickory-smoked chicken wings tossed in fiery Himalayan Dalle BBQ reduction.", price: 390, isVeg: false, isPopular: true, isChefSpecial: false },
        { name: "Truffle Mushroom Crostini", description: "Toasted sourdough topped with wild mushrooms sautéed in white wine, butter, and black truffle oil.", price: 380, isVeg: true, isPopular: false, isChefSpecial: true },
        { name: "Crispy Fish Fingers with Tartar", description: "Golden crumbed river trout strips served with house-pickled tartar sauce and lemon wedge.", price: 420, isVeg: false, isPopular: false, isChefSpecial: false, isSoldOut: true },
        { name: "Charred Garlic Butter Prawns", description: "Pan-seared jumbo prawns with garlic, crushed red pepper, and parsley in lemon butter emulsion.", price: 520, isVeg: false, isPopular: true, isChefSpecial: true },
      ],
    },
    {
      name: "Momos",
      description: "Hand-folded Himalayan dumplings served with secret Dalle chili dip",
      displayOrder: 2,
      dishes: [
        { name: "Classic Steamed Chicken Momos", description: "Traditional minced chicken dumplings infused with spring onion and ginger, served with Dalle chutney.", price: 220, isVeg: false, isPopular: true, isChefSpecial: false },
        { name: "Pan-Fried Cheese & Vegetable Momos", description: "Crispy bottom dumplings stuffed with local Sikkim cheese, sweet corn, and cabbage.", price: 240, isVeg: true, isPopular: true, isChefSpecial: false },
        { name: "Jhol Momo Bowls", description: "Steamed chicken momos immersed in a hot, tangy sesame, soybean, and tomato broth.", price: 260, isVeg: false, isPopular: false, isChefSpecial: true },
        { name: "Chili Garlic Pork Momos", description: "Wok-tossed pork dumplings coated in fiery Sichuan garlic sauce with fresh bell peppers.", price: 280, isVeg: false, isPopular: true, isChefSpecial: true },
        { name: "Kothey Paneer Dumplings", description: "Half-steamed, half-pan-fried cottage cheese momos served with roasted tomato salsa.", price: 230, isVeg: true, isPopular: false, isChefSpecial: false },
        { name: "Open Cheese & Spinach Dumplings", description: "Artisanal open-topped dumplings topped with melted cheddar, wilted spinach, and nutmeg.", price: 270, isVeg: true, isPopular: false, isChefSpecial: false, isSoldOut: true },
      ],
    },
    {
      name: "Burgers",
      description: "Craft brioche bun burgers served with house seasoned potato wedges",
      displayOrder: 3,
      dishes: [
        { name: "Himalayan Dalle Chicken Burger", description: "Crispy fried chicken breast, Dalle mayo, pickled cucumbers, shredded lettuce in toasted brioche.", price: 360, isVeg: false, isPopular: true, isChefSpecial: true },
        { name: "Double Smash Cheese Burger", description: "Two smashed beef patties, double cheddar cheese, caramelized onions, house burger sauce.", price: 440, isVeg: false, isPopular: true, isChefSpecial: false },
        { name: "Truffle Black Bean Veggie Burger", description: "Spiced black bean and quinoa patty, truffle aioli, avocado, arugula, and Swiss cheese.", price: 330, isVeg: true, isPopular: false, isChefSpecial: true },
        { name: "Crispy Cottage Cheese Burger", description: "Panko crust paneer patty, spicy harissa spread, grilled peppers, and iceberg lettuce.", price: 320, isVeg: true, isPopular: false, isChefSpecial: false },
        { name: "Slow Cooked Pulled Pork Slider Trio", description: "Three mini sliders filled with 12-hour slow cooked pork, apple slaw, and smoky BBQ sauce.", price: 410, isVeg: false, isPopular: false, isChefSpecial: false, isSoldOut: true },
        { name: "Mushroom Melt Burger", description: "Grilled chicken patty topped with sautéed wild mushrooms, melted gruyere cheese, and garlic butter.", price: 390, isVeg: false, isPopular: false, isChefSpecial: false },
      ],
    },
    {
      name: "Pizza",
      description: "Artisanal 12-inch sourdough crust pizzas cooked in wood-fired oven",
      displayOrder: 4,
      dishes: [
        { name: "Margherita Sourdough Pizza", description: "San Marzano tomato sauce, fresh buffalo mozzarella, extra virgin olive oil, and fresh basil leaves.", price: 460, isVeg: true, isPopular: true, isChefSpecial: false },
        { name: "Spicy Pepperoni & Honey", description: "Artisanal pork pepperoni, hot honey drizzle, chili flakes, mozzarella, and tomato base.", price: 580, isVeg: false, isPopular: true, isChefSpecial: true },
        { name: "Wild Mushroom & Truffle Pizza", description: "White sauce base, porcini & button mushrooms, fontina cheese, thyme, and black truffle oil.", price: 560, isVeg: true, isPopular: false, isChefSpecial: true },
        { name: "BBQ Smoked Chicken Pizza", description: "Pulled BBQ chicken, caramelized onions, smoked gouda, mozzarella, and cilantro.", price: 520, isVeg: false, isPopular: true, isChefSpecial: false },
        { name: "Four Cheese Bianca", description: "Mozzarella, gorgonzola blue cheese, ricotta, parmesan, and roasted garlic oil.", price: 540, isVeg: true, isPopular: false, isChefSpecial: false },
        { name: "Garden Harvest Veggie Pizza", description: "Zucchini, bell peppers, Kalamata olives, red onions, feta cheese, and basil pesto base.", price: 480, isVeg: true, isPopular: false, isChefSpecial: false },
      ],
    },
    {
      name: "Chinese",
      description: "High-flame wok tossed noodles, fried rice, and savory gravies",
      displayOrder: 5,
      dishes: [
        { name: "Chili Garlic Hack Noodles", description: "Hand-pulled noodles tossed with scallions, crushed garlic, dark soy, and toasted chili oil.", price: 290, isVeg: true, isPopular: true, isChefSpecial: false },
        { name: "Kung Pao Chicken", description: "Diced chicken wok-tossed with peanuts, dry red chili, bell peppers, and sweet soy reduction.", price: 380, isVeg: false, isPopular: true, isChefSpecial: true },
        { name: "Crispy Vegetable Manchurian Gravy", description: "Fried vegetable dumplings simmered in ginger, garlic, cilantro, and dark soy broth.", price: 310, isVeg: true, isPopular: false, isChefSpecial: false },
        { name: "Yangzhou Fried Rice", description: "Wok-fried jasmine rice with shrimp, char siu chicken, sweet peas, and egg ribbons.", price: 360, isVeg: false, isPopular: false, isChefSpecial: true },
        { name: "Schezwan Paneer Gravy", description: "Fresh cottage cheese cubes cooked in house Schezwan chili paste, bell peppers, and scallions.", price: 330, isVeg: true, isPopular: false, isChefSpecial: false },
        { name: "Stir-Fried Asian Greens", description: "Bok choy, broccoli, snow peas, and water chestnuts tossed in light sesame garlic sauce.", price: 320, isVeg: true, isPopular: false, isChefSpecial: false },
      ],
    },
    {
      name: "Beverages",
      description: "Freshly brewed coolers, iced teas, handcrafted sodas, and espresso specialties",
      displayOrder: 6,
      dishes: [
        { name: "Himalayan Dalle Iced Tea", description: "House brewed black tea infused with passion fruit, fresh mint, lemon, and a subtle chili kick.", price: 180, isVeg: true, isPopular: true, isChefSpecial: true },
        { name: "Fresh Peach & Mint Cooler", description: "Muddled white peach puree, fresh spearmint, lime, and sparkling soda.", price: 190, isVeg: true, isPopular: true, isChefSpecial: false },
        { name: "Double Shot Vanilla Espresso Shakerato", description: "Shaken espresso over ice with Madagascar vanilla bean syrup and oat milk foam.", price: 210, isVeg: true, isPopular: false, isChefSpecial: true },
        { name: "Matcha Coconut Cloud Iced Latte", description: "Uji Japanese ceremonial matcha layered over creamy coconut milk and organic agave.", price: 240, isVeg: true, isPopular: false, isChefSpecial: false },
        { name: "Wild Berry Hibiscus Kombucha", description: "Raw fermented kombucha infused with wild Himalayan berries and dried hibiscus flowers.", price: 220, isVeg: true, isPopular: false, isChefSpecial: false, isSoldOut: true },
        { name: "Fresh Watermelon & Basil Breeze", description: "Cold-pressed fresh watermelon juice, Thai basil leaves, Himalayan pink salt, and lime.", price: 170, isVeg: true, isPopular: false, isChefSpecial: false },
      ],
    },
    {
      name: "Desserts",
      description: "Decadent sweet endings, house patisserie, and artisanal ice creams",
      displayOrder: 7,
      dishes: [
        { name: "Warm Belgian Chocolate Lava Cake", description: "Molten dark chocolate center cake served with artisanal Madagascar vanilla bean gelato.", price: 290, isVeg: true, isPopular: true, isChefSpecial: true },
        { name: "Classic Italian Tiramisu", description: "Savoiardi ladyfingers soaked in espresso and Kahlua, layered with whipped mascarpone cream.", price: 320, isVeg: true, isPopular: true, isChefSpecial: false },
        { name: "Mango & Passion Fruit Cheesecake", description: "Baked New York style cheesecake topped with fresh Alphonso mango coulis and passion fruit seeds.", price: 310, isVeg: true, isPopular: false, isChefSpecial: true },
        { name: "Caramel Panna Cotta", description: "Silky vanilla bean cream dessert served with salted butter caramel and almond brittle.", price: 270, isVeg: true, isPopular: false, isChefSpecial: false },
        { name: "Hazelnut Brownie Sundae", description: "Fudge chocolate brownie topped with roasted hazelnuts, hot fudge sauce, and dark chocolate chips.", price: 280, isVeg: true, isPopular: false, isChefSpecial: false },
        { name: "Seasonal Fruit & Berry Tart", description: "Butter crust filled with vanilla pastry cream and topped with fresh strawberries and blueberries.", price: 290, isVeg: true, isPopular: false, isChefSpecial: false, isSoldOut: true },
      ],
    },
  ];

  let totalCategoriesSeeded = 0;
  let totalDishesSeeded = 0;

  for (const catData of seedData) {
    const existingCat = await prisma.category.findFirst({
      where: { restaurantId: restaurant.id, name: catData.name },
    });

    const category = existingCat
      ? await prisma.category.update({
          where: { id: existingCat.id },
          data: {
            description: catData.description,
            displayOrder: catData.displayOrder,
            isActive: true,
            isDeleted: false,
          },
        })
      : await prisma.category.create({
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

    for (const [idx, dish] of catData.dishes.entries()) {
      const existingDish = await prisma.menuItem.findFirst({
        where: { restaurantId: restaurant.id, categoryId: category.id, name: dish.name },
      });

      if (existingDish) {
        await prisma.menuItem.update({
          where: { id: existingDish.id },
          data: {
            description: dish.description,
            price: dish.price,
            isVeg: dish.isVeg,
            isPopular: dish.isPopular,
            isChefSpecial: dish.isChefSpecial,
            isSoldOut: dish.isSoldOut ?? false,
            displayOrder: idx + 1,
            isActive: true,
            isDeleted: false,
          },
        });
      } else {
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
            isSoldOut: dish.isSoldOut ?? false,
            displayOrder: idx + 1,
            isActive: true,
            isDeleted: false,
          },
        });
      }
      totalDishesSeeded++;
    }
  }

  console.log(`✅ Categories seeded: ${totalCategoriesSeeded}`);
  console.log(`✅ Menu Items seeded: ${totalDishesSeeded}`);

  // 5. Seed Initial Audit Log Record (Idempotent)
  const existingAudit = await prisma.auditLog.findFirst({
    where: { restaurantId: restaurant.id, action: "INITIAL_DATABASE_SEEDED" },
  });

  if (!existingAudit) {
    await prisma.auditLog.create({
      data: {
        restaurantId: restaurant.id,
        action: "INITIAL_DATABASE_SEEDED",
        entity: "Database",
        entityId: restaurant.id,
        metadata: {
          seededBy: "Sprint 08.1 Seed Script",
          categoriesCount: totalCategoriesSeeded,
          dishesCount: totalDishesSeeded,
          adminEmail: adminUser.email,
        },
      },
    });
    console.log("✅ Initial Audit Log entry created.");
  }

  console.log("🚀 Smart Tech Food Hub Database Seeding Completed Successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
