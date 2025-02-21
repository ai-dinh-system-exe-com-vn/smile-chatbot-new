/**
 * IndexedDBRepository.ts
 * 
 * Lớp này cung cấp các phương thức để tương tác với indexedDB cho một table (object store) nhất định.
 * Các phương thức bao gồm: store, update, delete, get, getById.
 * Sử dụng Dexie để quản lý IndexedDB.
 *
 * Sử dụng:
 *   const repo = new IndexedDBRepository<MyDataType>('ten_table');
 *   (Lưu ý: các đối tượng được lưu phải có thuộc tính 'id')
 */
import Dexie from 'dexie';

class AppDatabase extends Dexie {
    constructor(dbName: string) {
        super(dbName);
    }

    addStore(storeName: string) {
        this.version(1).stores({
            [storeName]: 'id'
        });
    }
}

export class IndexedDBRepository<T extends { id: string | number }> {
    private db: AppDatabase;
    private table: Dexie.Table<T, string | number>;

    constructor(storeName: string, dbName: string = "ConversationDB") {
        this.db = new AppDatabase(dbName);
        this.db.addStore(storeName);
        this.table = this.db.table(storeName);
    }

    /**
     * Thêm một bản ghi vào table.
     * @param data Dữ liệu cần lưu (phải có thuộc tính id).
     * @returns Một Promise trả về id của bản ghi được thêm.
     */
    async store(data: T): Promise<T['id']> {
        await this.table.add(data);
        return data.id;
    }

    /**
     * Cập nhật một bản ghi trong table.
     * @param data Dữ liệu cần cập nhật (phải có thuộc tính id).
     * @returns Một Promise hoàn thành khi cập nhật thành công.
     */
    async update(data: T): Promise<void> {
        await this.table.put(data);
    }

    /**
     * Xóa một bản ghi khỏi table theo id.
     * @param id Id của bản ghi cần xóa.
     * @returns Một Promise hoàn thành khi xóa thành công.
     */
    async delete(id: T['id']): Promise<void> {
        await this.table.delete(id);
    }

    /**
     * Lấy tất cả các bản ghi trong table.
     * @returns Một Promise trả về mảng các bản ghi.
     */
    async get(): Promise<T[]> {
        return await this.table.toArray();
    }

    /**
     * Lấy một bản ghi theo id.
     * @param id Id của bản ghi cần lấy.
     * @returns Một Promise trả về bản ghi hoặc undefined nếu không tồn tại.
     */
    async getById(id: T['id']): Promise<T | undefined> {
        return await this.table.get(id);
    }
}
