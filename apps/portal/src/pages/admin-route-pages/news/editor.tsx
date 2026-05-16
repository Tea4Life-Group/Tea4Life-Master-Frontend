"use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import type { DragEndEvent } from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";

import { handleError, getMediaUrl } from "@/lib/utils";
import AdminPageHeader from "@/pages/admin-route-pages/components/AdminPageHeader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Newspaper, Loader2, Save, ArrowLeft, ImagePlus, AlignLeft } from "lucide-react";

import {
  getAdminNewsByIdApi,
  createAdminNewsApi,
  updateAdminNewsApi,
  getAdminNewsCategoriesApi,
} from "@/services/admin/newsAdminApi";

import type { NewsCategoryResponse } from "@/types/news/NewsCategoryResponse";
import type { NewsChunkRequest } from "@/types/news/NewsRequest";
import ChunkItem from "./components/ChunkItem";
import { handleUpload } from "@/services/storageApi";

// Temporary interface for state management because dnd-kit needs a unique primitive string ID for sorting.
// NewsChunkRequest from BE doesn't have an ID, relying entirely on sortIndex.
interface EditorChunk extends NewsChunkRequest {
  id: string; // uuid for dnd-kit representation
}

export default function AdminNewsEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingThumb, setUploadingThumb] = useState(false);

  const [categories, setCategories] = useState<NewsCategoryResponse[]>([]);

  // Form State
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState<string>("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [chunks, setChunks] = useState<EditorChunk[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    const initFetch = async () => {
      setLoading(true);
      try {
        const catRes = await getAdminNewsCategoriesApi();
        setCategories(catRes.data.data || []);

        if (isEditMode && id) {
          const detailRes = await getAdminNewsByIdApi(id);
          const data = detailRes.data.data;
          
          setTitle(data.title);
          setThumbnailUrl(data.thumbnailUrl);
          
          if (data.category?.id) {
            setCategoryId(data.category.id.toString());
          }

          // Transform for Dnd-kit
          const initialChunks = (data.chunks || []).map((c: any) => ({
            id: `chunk-${crypto.randomUUID()}`,
            type: c.type,
            content: c.content,
            sortIndex: c.sortIndex,
          }));
          // Sort them by sortIndex first
          initialChunks.sort((a, b) => a.sortIndex - b.sortIndex);
          setChunks(initialChunks);
        }
      } catch (error) {
        handleError(error, "Không thể tải dữ liệu.");
      } finally {
        setLoading(false);
      }
    };
    initFetch();
  }, [id, isEditMode]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setChunks((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        
        // Use arrayMove from dnd-kit
        const newItems = arrayMove(items, oldIndex, newIndex);
        
        // Re-assign sortIndex based on new array order
        return newItems.map((item, index) => ({
          ...item,
          sortIndex: index,
        }));
      });
    }
  };

  const addChunk = (type: "TEXT" | "IMAGE") => {
    const newChunk: EditorChunk = {
      id: `chunk-${crypto.randomUUID()}`,
      type,
      content: "",
      sortIndex: chunks.length,
    };
    setChunks([...chunks, newChunk]);
  };

  const removeChunk = (targetId: string) => {
    setChunks((prev) => {
      const filtered = prev.filter((c) => c.id !== targetId);
      return filtered.map((c, index) => ({ ...c, sortIndex: index }));
    });
  };

  const updateChunkContent = (targetId: string, newContent: string) => {
    setChunks((prev) =>
      prev.map((c) => (c.id === targetId ? { ...c, content: newContent } : c))
    );
  };

  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file hình ảnh hợp lệ.");
      return;
    }

    setUploadingThumb(true);
    try {
      const key = await handleUpload(file);
      if (key) {
        setThumbnailUrl(key);
      } else {
        toast.error("Tải ảnh bìa thất bại.");
      }
    } catch (err) {
      toast.error("Có lỗi xảy ra khi upload ảnh.");
    } finally {
      setUploadingThumb(false);
      e.target.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !categoryId || chunks.length === 0) {
      toast.error("Vui lòng điền tiêu đề, danh mục và ít nhất 1 nội dung.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title,
        thumbnailUrl,
        categoryId: categoryId,
        chunks: chunks.map(c => ({
          type: c.type,
          content: c.content,
          sortIndex: c.sortIndex,
        })),
      };

      if (isEditMode && id) {
        await updateAdminNewsApi(id, payload);
        toast.success("Cập nhật bài viết thành công!");
      } else {
        await createAdminNewsApi(payload);
        toast.success("Tạo bài viết mới thành công!");
      }
      navigate("/admin/news");
    } catch (error) {
      handleError(error, "Lưu bài viết thất bại.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[300px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-20 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate("/admin/news")}
          className="h-10 w-10 shrink-0 rounded-full"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <AdminPageHeader
            icon={Newspaper}
            title={isEditMode ? "Chỉnh sửa Bài viết" : "Tạo Bài viết Mới"}
            description="Kéo thả nội dung để sắp xếp bố cục."
          />
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* THÔNG TIN CƠ BẢN */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <h3 className="text-lg font-bold text-slate-800">Thông tin cơ bản</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-slate-700 font-semibold">Tiêu đề bài viết</Label>
                <Input
                  id="title"
                  placeholder="Nhập tiêu đề..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={saving}
                  className="rounded-xl h-11"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category" className="text-slate-700 font-semibold">Danh mục</Label>
                <Select disabled={saving} value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger id="category" className="rounded-xl h-11">
                    <SelectValue placeholder="-- Chọn danh mục --" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id.toString()}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Thumbnail Upload Area */}
            <div className="space-y-2">
              <Label className="text-slate-700 font-semibold">Ảnh bìa (Thumbnail)</Label>
              <div className="relative border-2 border-dashed border-slate-300 rounded-xl bg-slate-50 overflow-hidden h-[155px] flex flex-col items-center justify-center group">
                {thumbnailUrl ? (
                  <>
                    <img src={getMediaUrl(thumbnailUrl)} alt="Thumbnail" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                      <Label className="cursor-pointer bg-white text-slate-800 px-4 py-2 rounded-lg text-sm font-bold shadow-md hover:bg-emerald-50 transition-colors">
                        Đổi Ảnh Bìa
                        <Input type="file" className="hidden" accept="image/*" disabled={saving || uploadingThumb} onChange={handleThumbnailUpload} />
                      </Label>
                    </div>
                  </>
                ) : (
                  <div className="text-center p-4">
                    {uploadingThumb ? (
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-emerald-500" />
                    ) : (
                      <>
                        <ImagePlus className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                        <span className="text-xs text-slate-500">Tải ảnh lên (Max 5MB)</span>
                        <Input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" accept="image/*" disabled={saving || uploadingThumb} onChange={handleThumbnailUpload} />
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* NỘI DUNG (CHUNKS) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-800">Soạn thảo Nội dung</h3>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                className="bg-white hover:bg-emerald-50 hover:text-emerald-700 border-slate-200 h-9 font-bold rounded-lg shadow-sm"
                onClick={() => addChunk("TEXT")}
                disabled={saving}
              >
                <AlignLeft className="h-4 w-4 mr-2" />
                Thêm Văn Bản
              </Button>
              <Button
                type="button"
                variant="outline"
                className="bg-white hover:bg-emerald-50 hover:text-emerald-700 border-slate-200 h-9 font-bold rounded-lg shadow-sm"
                onClick={() => addChunk("IMAGE")}
                disabled={saving}
              >
                <ImagePlus className="h-4 w-4 mr-2" />
                Thêm Hình Ảnh
              </Button>
            </div>
          </div>

          <div className="bg-[#f8fcfb] border border-emerald-100 rounded-2xl p-4 min-h-[300px]">
            {chunks.length === 0 ? (
              <div className="h-[200px] flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-emerald-200/50 rounded-xl">
                <AlignLeft className="h-8 w-8 mb-3 opacity-50" />
                <p>Bài viết chưa có nội dung.</p>
                <p className="text-sm mt-1">Bấm nút "Thêm Văn Bản" hoặc "Thêm Hình Ảnh" phía trên.</p>
              </div>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext items={chunks.map(c => c.id)} strategy={verticalListSortingStrategy}>
                  <div className="space-y-4">
                    {chunks.map((chunk) => (
                      <ChunkItem
                        key={chunk.id}
                        id={chunk.id}
                        chunk={chunk}
                        disabled={saving}
                        onChange={(content) => updateChunkContent(chunk.id, content)}
                        onRemove={() => removeChunk(chunk.id)}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            )}
          </div>
        </div>

        {/* BẢNG ĐIỀU KHIỂN NỔI DƯỚI ĐÁY */}
        <div className="fixed bottom-0 left-0 right-0 md:left-[264px] bg-white border-t p-4 z-40 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
          <div className="max-w-5xl mx-auto flex items-center justify-between">
            <span className="text-sm font-medium text-slate-500">
              Trạng thái: {isEditMode ? "Đang chỉnh sửa" : "Tạo bài mới"}
            </span>
            <div className="flex items-center gap-3">
              <Button type="button" variant="ghost" onClick={() => navigate("/admin/news")} disabled={saving}>
                Hủy bỏ
              </Button>
              <Button type="submit" disabled={saving || uploadingThumb} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-200/50 min-w-[140px] font-bold">
                {saving ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5 mr-2" />
                    Lưu Bài Viết
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
