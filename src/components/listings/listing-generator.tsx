'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import Image from 'next/image';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { Book } from '@/lib/types';
import { generateEnhancedListingText } from '@/ai/flows/generate-enhanced-listing-text';
import { Wand2, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '../ui/skeleton';

export function ListingGenerator({ books }: { books: Book[] }) {
  const [selectedBookId, setSelectedBookId] = React.useState<string | null>(null);
  const [listingText, setListingText] = React.useState('');
  const [imagePreview, setImagePreview] = React.useState<string | null>(null);
  const [imageFit, setImageFit] = React.useState<'contain' | 'cover'>('cover');
  const [isGenerating, setIsGenerating] = React.useState(false);

  const { toast } = useToast();

  const previewImage = imagePreview || PlaceHolderImages.find(img => img.id === 'listing_preview')?.imageUrl || '';

  const selectedBook = React.useMemo(() => {
    return books.find((b) => b.id === selectedBookId) || null;
  }, [selectedBookId, books]);

  React.useEffect(() => {
    if (selectedBook) {
      setListingText(`Check out this amazing book: ${selectedBook.name}!`);
    } else {
      setListingText('');
    }
  }, [selectedBook]);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEnhanceText = async () => {
    if (!selectedBook) {
      toast({
        title: 'No book selected',
        description: 'Please select a book first.',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateEnhancedListingText({
        bookTitle: selectedBook.name,
        bookDescription: listingText,
      });
      setListingText(result.enhancedListingText);
      toast({
        title: 'Text Enhanced!',
        description: 'The listing description has been refined by AI.',
      });
    } catch (error) {
      console.error(error);
      toast({
        title: 'Enhancement Failed',
        description: 'Could not generate enhanced text. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied to clipboard!' });
  };

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Controls</CardTitle>
          <CardDescription>Select a book, upload an image, and craft your listing.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="book-select">Book</Label>
            <Select onValueChange={setSelectedBookId}>
              <SelectTrigger id="book-select">
                <SelectValue placeholder='Select a book from your catalog' />
              </SelectTrigger>
              <SelectContent>
                {books.map((book) => (
                  <SelectItem key={book.id} value={book.id}>
                    {book.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="image-upload">Cover Image</Label>
            <Input id="image-upload" type="file" accept="image/*" onChange={handleImageUpload} />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="listing-text">Listing Text</Label>
              <Button variant="ghost" size="sm" onClick={handleEnhanceText} disabled={isGenerating || !selectedBook}>
                <Wand2 className="mr-2 h-4 w-4" />
                {isGenerating ? 'Enhancing...' : 'Enhance with AI'}
              </Button>
            </div>
            {isGenerating ? (
                <div className="space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-4/5" />
                </div>
            ) : (
                <Textarea
                    id="listing-text"
                    value={listingText}
                    onChange={(e) => setListingText(e.target.value)}
                    rows={8}
                    placeholder='Write your book description here...'
                />
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
                <CardTitle>Preview</CardTitle>
                <CardDescription>This is how your listing will appear.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
                <Select onValueChange={(value) => setImageFit(value as 'cover' | 'contain')} defaultValue={imageFit}>
                    <SelectTrigger className="w-[120px]">
                        <SelectValue placeholder='Image Fit' />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="cover">Fill Frame</SelectItem>
                        <SelectItem value="contain">Fit Image</SelectItem>
                    </SelectContent>
                </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border bg-muted">
            <Image
              src={previewImage}
              alt="Listing preview"
              fill
              className={`object-${imageFit}`}
              data-ai-hint="book product"
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
                <h3 className="font-headline text-2xl font-bold">{selectedBook?.name || 'Book Title'}</h3>
                <Button variant="ghost" size="icon" onClick={() => copyToClipboard(selectedBook?.name || '')}>
                    <Copy className="h-4 w-4" />
                    <span className="sr-only">Copy title</span>
                </Button>
            </div>
            <div className="relative">
                <p className="text-muted-foreground">{listingText || 'Your compelling book description will appear here.'}</p>
                 <Button variant="ghost" size="icon" className="absolute -top-2 right-0" onClick={() => copyToClipboard(listingText)}>
                    <Copy className="h-4 w-4" />
                    <span className="sr-only">Copy description</span>
                </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
