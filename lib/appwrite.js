import {
  Account,
  Avatars,
  Client,
  Databases,
  ID,
  Query,
} from "react-native-appwrite";

const env_endpoint = process.env.EXPO_PUBLIC_Endpoint;
const env_platform = process.env.EXPO_PUBLIC_Platform;
const env_projectId = process.env.EXPO_PUBLIC_ProjectId;
const env_databaseId = process.env.EXPO_PUBLIC_DatabaseId;
const env_collection = process.env.EXPO_PUBLIC_CollectionId;
const env_videoCollectionId = process.env.EXPO_PUBLIC_VideoCollectionId;
const env_storageId = process.env.EXPO_PUBLIC_StorageId;

export const config = {
  endpoint: env_endpoint,
  platform: env_platform,
  projectId: env_projectId,
  databaseId: env_databaseId,
  collectionId: env_collection,
  videoCollectionId: env_videoCollectionId,
  storageId: env_storageId,
};

const client = new Client();

client
  .setEndpoint(config.endpoint)
  .setProject(config.projectId)
  .setPlatform(config.platform);

const account = new Account(client);
const avatars = new Avatars(client);
const databases = new Databases(client);

export const createUser = async (email, password, username) => {
  try {
    const newAccount = await account.create(
      ID.unique(),
      email,
      password,
      username
    );
    if (!newAccount) throw Error;

    const avatarUrl = avatars.getInitials(username);

    await signIn(email, password);

    const newUser = await databases.createDocument(
      config.databaseId,
      config.collectionId,
      ID.unique(),
      {
        accountId: newAccount.$id,
        email: email,
        username: username,
        avatar: avatarUrl,
      }
    );

    return newUser;
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

export const signIn = async (email, password) => {
  try {
    const currentSession = await account.getSession("current");
    if (currentSession) return currentSession;
    const newSession = await account.createEmailPasswordSession(
      email,
      password
    );
    return newSession;
  } catch (error) {
    throw new Error(error);
  }
};

export const getCurrentUser = async () => {
  try {
    const currentAccount = await account.get();

    if (!currentAccount) throw Error;

    const currentUser = await databases.listDocuments(
      config.databaseId,
      config.collectionId,
      [Query.equal("accountId", currentAccount.$id)]
    );

    if (!currentUser) throw Error;

    return currentUser.documents[0];
  } catch (error) {
    console.log(error);
  }
};

export async function getAllPosts() {
  try {
    const posts = await databases.listDocuments(
      config.databaseId,
      config.videoCollectionId
    );
    // console.log(posts);
    // console.log(posts.documents);

    return posts.documents;
  } catch (error) {
    throw new Error(error);
  }
}

export async function getLatestPosts() {
  try {
    const posts = await databases.listDocuments(
      config.databaseId,
      config.videoCollectionId,
      [Query.orderDesc("$createdAt", Query.limit(7))]
    );
    // console.log(posts);
    // console.log(posts.documents);

    return posts.documents;
  } catch (error) {
    throw new Error(error);
  }
}
