/**
 * IndexedDBRepository.ts
 * 
 * Lớp này cung cấp các phương thức để tương tác với indexedDB cho một table (object store) nhất định.
 * Các phương thức bao gồm: store, update, delete, get, getById.
 *
 * Sử dụng:
 *   const repo = new IndexedDBRepository<MyDataType>('ten_table');
 *   (Lưu ý: các đối tượng được lưu sẽ có thuộc tính 'id' được tự động gán)
 */
export class IndexedDBRepository<T> {
    private dbName: string;
    private storeName: string;
    private version: number;
    private dbPromise: Promise<IDBDatabase>;

    constructor(storeName: string, dbName: string = "ConversationDB", version: number = 1) {
        this.dbName = dbName;
        this.storeName = storeName;
        this.version = version;
        this.dbPromise = this.openDB();
    }

    private openDB(): Promise<IDBDatabase> {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(this.dbName, this.version);
            request.onupgradeneeded = (event) => {
                const db = request.result;
                if (!db.objectStoreNames.contains(this.storeName)) {
                    // Tạo object store với keyPath "id" và tự động tăng
                    db.createObjectStore(this.storeName, { keyPath: "id"});
                }
            };
            request.onsuccess = () => {
                resolve(request.result);
            };
            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    /**
     * Thêm một bản ghi vào table.
     * @param data Dữ liệu cần lưu.
     * @returns Một Promise trả về id của bản ghi được thêm.
     */
    async store(data: T): Promise<number> {
        const db = await this.dbPromise;
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(this.storeName, "readwrite");
            const store = transaction.objectStore(this.storeName);
            const request = store.add(data);
            request.onsuccess = () => {
                resolve(request.result as number);
            };
            request.onerror = () => {
                reject(request.error);
            };
        });
    }

    /**
     * Cập nhật một bản ghi trong table.
     * @param data Dữ liệu cần cập nhật (phải có thuộc tính id).
     * @returns Một Promise hoàn thành khi cập nhật thành công.
     */
    async update(data: T): Promise<void> {
        const db = await this.dbPromise;
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(this.storeName, "readwrite");
            const store = transaction.objectStore(this.storeName);
            const request = store.put(data);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Xóa một bản ghi khỏi table theo id.
     * @param id Id của bản ghi cần xóa.
     * @returns Một Promise hoàn thành khi xóa thành công.
     */
    async delete(id: number): Promise<void> {
        const db = await this.dbPromise;
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(this.storeName, "readwrite");
            const store = transaction.objectStore(this.storeName);
            const request = store.delete(id);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Lấy tất cả các bản ghi trong table.
     * @returns Một Promise trả về mảng các bản ghi.
     */
    async get(): Promise<T[]> {
        const db = await this.dbPromise;
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(this.storeName, "readonly");
            const store = transaction.objectStore(this.storeName);
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    /**
     * Lấy một bản ghi theo id.
     * @param id Id của bản ghi cần lấy.
     * @returns Một Promise trả về bản ghi hoặc undefined nếu không tồn tại.
     */
    async getById(id: number): Promise<T | undefined> {
        const db = await this.dbPromise;
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(this.storeName, "readonly");
            const store = transaction.objectStore(this.storeName);
            const request = store.get(id);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
}