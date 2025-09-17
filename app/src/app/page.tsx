import { redirect } from 'next/navigation';

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const tgWebAppStartParam = params.tgWebAppStartParam;
  
  if (tgWebAppStartParam) {
    redirect(`/shop/virtual-number?tgWebAppStartParam=${tgWebAppStartParam}`);
  } else {
    redirect('/shop/virtual-number');
  }
}
