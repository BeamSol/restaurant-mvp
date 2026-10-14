import SiteLayout from "./(site)/layout";
import NotFoundContent from "@/components/site/NotFoundContent";

/** 404 for any unknown URL, shown inside the normal site header/footer. */
export default function NotFound() {
  return (
    <SiteLayout>
      <NotFoundContent />
    </SiteLayout>
  );
}
