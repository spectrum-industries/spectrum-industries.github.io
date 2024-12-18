import { sql } from '@vercel/postgres';
import {
  CustomerField,
  CustomersTableType,
  InvoiceForm,
  InvoicesTable,
  PlacesTable,
  LatestInvoiceRaw,
  Revenue,
  PlacesForm,
} from './definitions';
import { formatCurrency } from './utils';
import { Truculenta } from 'next/font/google';

export async function fetchRevenue() {
  try {
    // Artificially delay a response for demo purposes.
    // Don't do this in production :)
    // dong thsi is prod

    console.log('Fetching revenue data...');
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const data = await sql<Revenue>`SELECT * FROM revenue`;

    console.log('Data fetch completed after 3 seconds.');

    return data.rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch revenue data.');
  }
}

export async function fetchLatestInvoices() {
  try {
    const data = await sql<LatestInvoiceRaw>`
      SELECT invoices.amount, customers.name, customers.image_url, customers.email, invoices.id
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      ORDER BY invoices.date DESC
      LIMIT 5`;

    const latestInvoices = data.rows.map((invoice) => ({
      ...invoice,
      amount: formatCurrency(invoice.amount),
    }));
    return latestInvoices;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch the latest invoices.');
  }
}

export async function fetchCardData() {
  try {
    // You can probably combine these into a single SQL query
    // However, we are intentionally splitting them to demonstrate
    // how to initialize multiple queries in parallel with JS.
    const invoiceCountPromise = sql`SELECT COUNT(*) FROM invoices`;
    const customerCountPromise = sql`SELECT COUNT(*) FROM customers`;
    const invoiceStatusPromise = sql`SELECT
         SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) AS "paid",
         SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) AS "pending"
         FROM invoices`;

    const data = await Promise.all([
      invoiceCountPromise,
      customerCountPromise,
      invoiceStatusPromise,
    ]);

    const numberOfInvoices = Number(data[0].rows[0].count ?? '0');
    const numberOfCustomers = Number(data[1].rows[0].count ?? '0');
    const totalPaidInvoices = formatCurrency(data[2].rows[0].paid ?? '0');
    const totalPendingInvoices = formatCurrency(data[2].rows[0].pending ?? '0');

    return {
      numberOfCustomers,
      numberOfInvoices,
      totalPaidInvoices,
      totalPendingInvoices,
    };
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch card data.');
  }
}

const ITEMS_PER_PAGE = 10;
export async function fetchFilteredInvoices(
  query: string,
  currentPage: number,
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const invoices = await sql<InvoicesTable>`
      SELECT
        invoices.id,
        invoices.amount,
        invoices.date,
        invoices.status,
        customers.name,
        customers.email,
        customers.image_url
      FROM invoices
      JOIN customers ON invoices.customer_id = customers.id
      WHERE
        customers.name ILIKE ${`%${query}%`} OR
        customers.email ILIKE ${`%${query}%`} OR
        invoices.amount::text ILIKE ${`%${query}%`} OR
        invoices.date::text ILIKE ${`%${query}%`} OR
        invoices.status ILIKE ${`%${query}%`}
      ORDER BY invoices.date DESC
      LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
    `;

    return invoices.rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoices.');
  }
}

export async function fetchFilteredPlaces(
  query: string,
  currentPage: number,
  visited: string
) {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;
  try {
    let places = null;
    if (visited === "") {
      places = await sql<PlacesTable>`
        SELECT
          id,
          place,
          visited
        FROM places
        WHERE
          place ILIKE ${`%${query}%`}
        ORDER BY id ASC
        LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
      `;
    } else {
      // Convert visited to a boolean value for the query
      const visitedCondition = visited === "visited" ? true : false;
      places = await sql<PlacesTable>`
        SELECT
          id,
          place,
          visited
        FROM places
        WHERE
          place ILIKE ${`%${query}%`}
          AND visited = ${visitedCondition}
        ORDER BY id ASC
        LIMIT ${ITEMS_PER_PAGE} OFFSET ${offset}
      `;
    }
    return places?.rows;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch pages.');
  }
}


export async function fetchInvoicesPages(query: string) {
  try {
    const count = await sql`SELECT COUNT(*)
    FROM invoices
    JOIN customers ON invoices.customer_id = customers.id
    WHERE
      customers.name ILIKE ${`%${query}%`} OR
      customers.email ILIKE ${`%${query}%`} OR
      invoices.amount::text ILIKE ${`%${query}%`} OR
      invoices.date::text ILIKE ${`%${query}%`} OR
      invoices.status ILIKE ${`%${query}%`}
  `;

    const totalPages = Math.ceil(Number(count.rows[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of invoices.');
  }
}

export async function fetchInvoiceById(id: string) {
  try {
    const data = await sql<InvoiceForm>`
      SELECT
        invoices.id,
        invoices.customer_id,
        invoices.amount,
        invoices.status
      FROM invoices
      WHERE invoices.id = ${id};
    `;

    const invoice = data.rows.map((invoice) => ({
      ...invoice,
      // Convert amount from cents to dollars
      amount: invoice.amount / 100,
    }));

    return invoice[0];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoice.');
  }
}

export async function fetchCustomers() {
  try {
    const data = await sql<CustomerField>`
      SELECT
        id,
        name
      FROM customers
      ORDER BY name ASC
    `;

    const customers = data.rows;
    return customers;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch all customers.');
  }
}

export async function fetchFilteredCustomers(query: string) {
  try {
    const data = await sql<CustomersTableType>`
		SELECT
		  customers.id,
		  customers.name,
		  customers.email,
		  customers.image_url,
		  COUNT(invoices.id) AS total_invoices,
		  SUM(CASE WHEN invoices.status = 'pending' THEN invoices.amount ELSE 0 END) AS total_pending,
		  SUM(CASE WHEN invoices.status = 'paid' THEN invoices.amount ELSE 0 END) AS total_paid
		FROM customers
		LEFT JOIN invoices ON customers.id = invoices.customer_id
		WHERE
		  customers.name ILIKE ${`%${query}%`} OR
        customers.email ILIKE ${`%${query}%`}
		GROUP BY customers.id, customers.name, customers.email, customers.image_url
		ORDER BY customers.name ASC
	  `;

    const customers = data.rows.map((customer) => ({
      ...customer,
      total_pending: formatCurrency(customer.total_pending),
      total_paid: formatCurrency(customer.total_paid),
    }));

    return customers;
  } catch (err) {
    console.error('Database Error:', err);
    throw new Error('Failed to fetch customer table.');
  }
}

export async function fetchPlacesPages(query: string, visited: string) {
  const visitedBool = visited == "visited"? true : false;
  
  try {
    let count = null
    if (visited == ""){
      count = await sql`SELECT COUNT(*)
      FROM places
      WHERE
        place ILIKE ${`%${query}%`}
    `;
    } else {
      count = await sql`SELECT COUNT(*)
      FROM places
      WHERE
        place ILIKE ${`%${query}%`}
        AND visited = ${visitedBool}
    `;
    }
    const totalPages = Math.ceil(Number(count.rows[0].count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch total number of places.');
  }
}

export async function fetchPlaceById(id: string) {
  try {
    const data = await sql<PlacesForm>`
      SELECT
        places.id,
        places.place,
        places.visited
      FROM places
      WHERE places.id = ${id};
    `;
    return data.rows[0];
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch invoice.');
  }
}

export async function fetchFilteredPlacesCount(visitedCondition : boolean) {
  try {
    let places = null;
      places = await sql`
        SELECT
          COUNT(*)
        FROM places
        WHERE
         visited = ${visitedCondition};
      `;
      if(places){
        return places?.rows[0]?.count;
      }
      else return 0;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch pages.');
  }
}

export async function fetchPhotosCount() {
  try {
    let photos = await sql`
        SELECT
          COUNT(*)
        FROM album
      `;
      if(photos){
        return photos?.rows[0]?.count;
      }
      else return 0;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch pages.');
  }
}

export async function fetchRandomPhoto() {
  try {
    let photosCount = await fetchPhotosCount()
    let randomNumber = Math.floor(Math.random() * photosCount) + 1;
    let photo = await sql`
      SELECT 
        *
      FROM album
      WHERE 
      ID = ${randomNumber}  
    `
    if(photo){
    return photo?.rows[0]
    } else {
      return null
    }
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch pages.');
  }
}

export async function fetchTestLandscapePhoto() {
  try {
    let photo = await sql`
      SELECT 
        *
      FROM album
      WHERE 
      ID = ${438}  
    `
    if(photo){
    return photo?.rows[0]
    } else {
      return null
    }
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch pages.');
  }
}

export async function fetchTestPortraitPhoto() {
  try {
    let photo = await sql`
      SELECT 
        *
      FROM album
      WHERE 
      ID = ${444}  
    `
    if(photo){
    return photo?.rows[0]
    } else {
      return null
    }
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch pages.');
  }
}

export async function fetchPhotosDimensions() {
  try {
    let photos = await sql`
        SELECT
          DISTINCT height, width
        FROM album
      `;
      if(photos){
        return photos;
      }
      else return 0;
  } catch (error) {
    console.error('Database Error:', error);
    throw new Error('Failed to fetch pages.');
  }
}

export async function fetchPhotosInBatch(offset : number) {
  try{
    let photos = await sql`
    SELECT 
      *
    FROM album
    OFFSET ${offset * ITEMS_PER_PAGE}
    LIMIT ${ITEMS_PER_PAGE}
    `
    return photos;
  }
  catch(error) {
    console.log(error)
    throw new Error('Failed to fetch pages')
  }
}

