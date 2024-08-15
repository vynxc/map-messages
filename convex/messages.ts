import { query, mutation } from "./_generated/server";
import { ConvexError, v } from "convex/values";

export const add = mutation({
  args: {
    latitude: v.float64(),
    longitude: v.float64(),
    message: v.string()
  },
  handler: async (ctx, args) => {
    const nearby = await ctx.db.query("messages").filter(x => x.and(x.gte(x.field("latitude"), args.latitude - 0.0001), x.lte(x.field("latitude"), args.latitude + 0.0001), x.gte(x.field("longitude"), args.longitude - 0.0001), x.lte(x.field("longitude"), args.longitude + 0.0001))).collect();
    if (nearby.length > 3) {
      throw new ConvexError("Too many messages in this location");
    }
    await ctx.db.insert("messages", {
      ...args
    })
  },
});

export const getBounds = query({
  args: {
    minLatitude: v.float64(),
    maxLatitude: v.float64(),
    minLongitude: v.float64(),
    maxLongitude: v.float64(),
  },
  handler: async (ctx, args) => {


    // // Define the maximum allowable range for latitude and longitude
    // const maxLatitudeRange = 24.0; // Latitude range similar to the continental USA
    // const maxLongitudeRange = 65.0; // Longitude range similar to the continental USA

    // // Calculate the differences between max and min values
    // const latitudeRange = args.maxLatitude - args.minLatitude;
    // const longitudeRange = args.maxLongitude - args.minLongitude;

    // // Check if the bounds exceed the maximum allowable range
    // if (latitudeRange > maxLatitudeRange || longitudeRange > maxLongitudeRange) {
    //   return []; // Return an empty array if bounds are too wide
    // }

    const expansion = 0.005;

    const expandedMinLatitude = args.minLatitude - expansion;
    const expandedMaxLatitude = args.maxLatitude + expansion;
    const expandedMinLongitude = args.minLongitude - expansion;
    const expandedMaxLongitude = args.maxLongitude + expansion;


    return await ctx.db.query('messages').withIndex('by_latitude_longitude').filter(x => x.and(x.gte(x.field('latitude'), expandedMinLatitude), x.lte(x.field('latitude'), expandedMaxLatitude), x.gte(x.field('longitude'), expandedMinLongitude), x.lte(x.field('longitude'), expandedMaxLongitude))).take(300);
  },
});
