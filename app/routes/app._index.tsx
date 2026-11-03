import type {
  ActionFunctionArgs,
  HeadersFunction,
  LoaderFunctionArgs,
} from "react-router";
import { useLoaderData } from "react-router";
import { boundary } from "@shopify/shopify-app-react-router/server";

import { ProductList } from "~/components/products/product-list";
import type { ProductSummary, UserError } from "~/types/product";
import { authenticate } from "../shopify.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const response = await admin.graphql(
    `#graphql
      query ListProducts {
        products(first: 10) {
          nodes {
            id
            title
            status
          }
        }
      }`,
  );
  const responseJson = await response.json();
  const products = (responseJson.data?.products.nodes ??
    []) as ProductSummary[];

  return { products };
};

export const action = async ({ request }: ActionFunctionArgs) => {
  const { admin } = await authenticate.admin(request);
  const formData = await request.formData();
  const intent = String(formData.get("intent") ?? "");
  const id = String(formData.get("id") ?? "");

  if (!id) {
    return {
      intent,
      product: null,
      deletedProductId: null,
      userErrors: [{ field: ["id"], message: "Product ID is required" }],
    };
  }

  if (intent === "delete") {
    const response = await admin.graphql(
      `#graphql
        mutation DeleteProduct($input: ProductDeleteInput!) {
          productDelete(input: $input) {
            deletedProductId
            userErrors {
              field
              message
            }
          }
        }`,
      {
        variables: { input: { id } },
      },
    );
    const responseJson = await response.json();
    const result = responseJson.data?.productDelete as
      | {
          deletedProductId: string | null;
          userErrors: UserError[];
        }
      | undefined;

    return {
      intent,
      product: null,
      deletedProductId: result?.deletedProductId ?? null,
      userErrors: result?.userErrors ?? [],
    };
  }

  if (intent === "update") {
    const title = String(formData.get("title") ?? "").trim();

    if (!title) {
      return {
        intent,
        product: null,
        deletedProductId: null,
        userErrors: [{ field: ["title"], message: "Title is required" }],
      };
    }

    const response = await admin.graphql(
      `#graphql
        mutation UpdateProduct($product: ProductUpdateInput!) {
          productUpdate(product: $product) {
            product {
              id
              title
              status
            }
            userErrors {
              field
              message
            }
          }
        }`,
      {
        variables: { product: { id, title } },
      },
    );
    const responseJson = await response.json();
    const result = responseJson.data?.productUpdate as
      | {
          product: ProductSummary | null;
          userErrors: UserError[];
        }
      | undefined;

    return {
      intent,
      product: result?.product ?? null,
      deletedProductId: null,
      userErrors: result?.userErrors ?? [],
    };
  }

  return {
    intent,
    product: null,
    deletedProductId: null,
    userErrors: [{ field: ["intent"], message: "Unknown action" }],
  };
};

export default function Index() {
  const { products } = useLoaderData<typeof loader>();

  return <ProductList products={products} />;
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
