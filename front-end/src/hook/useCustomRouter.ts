import { useContextStore } from '@/context/store';
import { useRouter } from 'next/navigation';

const useCustomRouter = () => {
  const nextRouter = useRouter();
  const { isPending, startTransition } = useContextStore();

  return {
    push: (path: string, ...params: any) => {
      startTransition(() => {
        nextRouter.push(path, ...params);
      });
    },
  };
};

export default useCustomRouter;
