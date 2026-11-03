import { useEffect, useState } from "react";
import { useFetcher } from "react-router";
import { useAppBridge } from "@shopify/app-bridge-react";

import { ProductActions } from "~/components/products/product-actions";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import type { action } from "~/routes/app._index";
import type { ProductSummary } from "~/types/product";

type ProductListProps = {
  products: ProductSummary[];
};

export function ProductList({ products }: ProductListProps) {
  const fetcher = useFetcher<typeof action>();
  const shopify = useAppBridge();
  const [editingProduct, setEditingProduct] = useState<ProductSummary | null>(
    null,
  );
  const [deletingProduct, setDeletingProduct] = useState<ProductSummary | null>(
    null,
  );

  const isSubmitting = fetcher.state !== "idle";
  const submittingIntent = fetcher.formData?.get("intent");

  useEffect(() => {
    if (
      fetcher.state !== "idle" ||
      !fetcher.data ||
      fetcher.data.userErrors.length > 0
    ) {
      return;
    }

    if (fetcher.data.intent === "update" && fetcher.data.product) {
      shopify.toast.show("Product updated");
      setEditingProduct(null);
    }

    if (fetcher.data.intent === "delete" && fetcher.data.deletedProductId) {
      shopify.toast.show("Product deleted");
      setDeletingProduct(null);
    }
  }, [fetcher.data, fetcher.state, shopify]);

  const updateErrors =
    fetcher.data?.intent === "update" ? fetcher.data.userErrors : [];
  const deleteErrors =
    fetcher.data?.intent === "delete" ? fetcher.data.userErrors : [];

  return (
    <div className="min-h-full bg-muted/30 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-4xl">
        <Card className="gap-0 py-0">
          <CardHeader className="border-b py-4">
            <CardTitle>Products</CardTitle>
            <CardDescription>
              Edit or delete products from your development store.
            </CardDescription>
          </CardHeader>

          <CardContent className="px-0">
            {products.length === 0 ? (
              <div className="px-4 py-12 text-center text-sm text-muted-foreground">
                No products found.
              </div>
            ) : (
              <div className="divide-y">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="flex items-center gap-4 px-4 py-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{product.title}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {product.id}
                      </p>
                    </div>

                    <Badge
                      variant={
                        product.status === "ACTIVE" ? "default" : "secondary"
                      }
                    >
                      {product.status.toLowerCase()}
                    </Badge>

                    <ProductActions
                      product={product}
                      onEdit={setEditingProduct}
                      onDelete={setDeletingProduct}
                    />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog
        open={Boolean(editingProduct)}
        onOpenChange={(open) => {
          if (!open && !isSubmitting) setEditingProduct(null);
        }}
      >
        <DialogContent>
          <fetcher.Form method="post" className="grid gap-4">
            <input type="hidden" name="intent" value="update" />
            <input type="hidden" name="id" value={editingProduct?.id ?? ""} />

            <DialogHeader>
              <DialogTitle>Edit product</DialogTitle>
              <DialogDescription>
                Update the product title in Shopify.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-2">
              <label htmlFor="product-title" className="text-sm font-medium">
                Title
              </label>
              <Input
                id="product-title"
                name="title"
                defaultValue={editingProduct?.title ?? ""}
                required
              />
              {updateErrors.map((error) => (
                <p key={error.message} className="text-sm text-destructive">
                  {error.message}
                </p>
              ))}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingProduct(null)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && submittingIntent === "update"
                  ? "Saving..."
                  : "Save changes"}
              </Button>
            </DialogFooter>
          </fetcher.Form>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={Boolean(deletingProduct)}
        onOpenChange={(open) => {
          if (!open && !isSubmitting) setDeletingProduct(null);
        }}
      >
        <AlertDialogContent>
          <fetcher.Form method="post" className="grid gap-4">
            <input type="hidden" name="intent" value="delete" />
            <input type="hidden" name="id" value={deletingProduct?.id ?? ""} />

            <AlertDialogHeader>
              <AlertDialogTitle>Delete product?</AlertDialogTitle>
              <AlertDialogDescription>
                “{deletingProduct?.title}” will be permanently deleted. This
                action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>

            {deleteErrors.map((error) => (
              <p key={error.message} className="text-sm text-destructive">
                {error.message}
              </p>
            ))}

            <AlertDialogFooter>
              <AlertDialogCancel type="button" disabled={isSubmitting}>
                Cancel
              </AlertDialogCancel>
              <Button
                type="submit"
                variant="destructive"
                disabled={isSubmitting}
              >
                {isSubmitting && submittingIntent === "delete"
                  ? "Deleting..."
                  : "Delete"}
              </Button>
            </AlertDialogFooter>
          </fetcher.Form>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
