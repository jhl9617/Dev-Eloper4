'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { MoreHorizontal, Edit, Trash2, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { deletePost } from '@/lib/blog';
import { buttonVariants, modalVariants, dropdownVariants } from '@/lib/animations';
import type { PostWithRelations } from '@/lib/blog';

interface AdminActionsProps {
  post: PostWithRelations;
}

export function AdminActions({ post }: AdminActionsProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  const t = useTranslations('admin');
  const tCommon = useTranslations('common');

  const handleEdit = () => {
    router.push(`/admin/posts/${post.id}/edit`);
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    
    try {
      const result = await deletePost(post.id);
      
      if (result.success) {
        toast({
          title: t('postDeleted'),
          description: t('postDeletedSuccess'),
        });
        router.push('/posts');
        router.refresh();
      } else {
        throw new Error('Delete failed');
      }
    } catch (error) {
      toast({
        title: t('deleteFailed'),
        description: t('deleteError'),
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <motion.div
            variants={buttonVariants}
            initial="initial"
            whileHover="hover"
            whileTap="tap"
          >
            <Button variant="outline" size="sm" className="group">
              <motion.div
                animate={{ rotate: [0, 180, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                <Settings className="h-4 w-4 mr-2" />
              </motion.div>
              {t('manage')}
              <motion.div
                animate={{ rotate: [-90, 90, -90] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <MoreHorizontal className="h-4 w-4 ml-2" />
              </motion.div>
            </Button>
          </motion.div>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={handleEdit}>
            <Edit className="mr-2 h-4 w-4" />
            {tCommon('edit')}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={() => setShowDeleteDialog(true)}
            className="text-destructive"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {tCommon('delete')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AnimatePresence>
        {showDeleteDialog && (
          <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
            <AlertDialogContent asChild>
              <motion.div
                variants={modalVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
              >
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.5, repeat: Infinity }}
                    >
                      <Trash2 className="h-5 w-5 text-destructive" />
                    </motion.div>
                    {t('confirmDeletePost')}
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    {t('deleteWarning', { title: post.title })}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <AlertDialogCancel disabled={isDeleting}>{tCommon('cancel')}</AlertDialogCancel>
                  </motion.div>
                  <motion.div 
                    whileHover={{ scale: 1.05 }} 
                    whileTap={{ scale: 0.95 }}
                    animate={isDeleting ? { scale: [1, 1.05, 1] } : {}}
                    transition={isDeleting ? { duration: 0.5, repeat: Infinity } : {}}
                  >
                    <AlertDialogAction 
                      onClick={handleDelete}
                      disabled={isDeleting}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      {isDeleting ? (
                        <motion.span
                          animate={{ opacity: [1, 0.5, 1] }}
                          transition={{ duration: 1, repeat: Infinity }}
                        >
                          {t('deleting')}
                        </motion.span>
                      ) : (
                        tCommon('delete')
                      )}
                    </AlertDialogAction>
                  </motion.div>
                </AlertDialogFooter>
              </motion.div>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </AnimatePresence>
    </>
  );
}