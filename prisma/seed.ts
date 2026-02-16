import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const products = [
  {
    name: "Buldak",
    category: "Noodles",
    description: "Korean spicy instant noodles.",
    price: 15,
  },
  {
    name: "Indomie",
    category: "Noodles",
    description: "Indonesian-style instant noodles.",
    price: 10,
  },
  {
    name: "Chicken Popcorn (4 Pcs)",
    category: "Snacks",
    description: "Crispy bite-sized chicken pieces.",
    price: 5,
  },
  {
    name: "Custard Bun",
    category: "Snacks",
    description: "Soft bun filled with sweet custard.",
    price: 5,
  },
  {
    name: "Mochi",
    category: "Snacks",
    description: "Chewy Japanese rice cake treat.",
    price: 5,
  },
  {
    name: "Tteok Bokki",
    category: "Other",
    description: "Korean rice cakes in spicy sauce.",
    price: 10,
  },
  {
    name: "Cheese Add On",
    category: "Other",
    description: "Extra cheese topping for your order.",
    price: 5,
  },
];

async function main() {
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.product.deleteMany();

  await prisma.product.createMany({
    data: products,
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
